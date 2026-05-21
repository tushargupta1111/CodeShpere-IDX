/**
 * CodeSphere — Hybrid Execution Engine
 *
 * Strategy:
 *   JavaScript  → sandboxed <iframe> (instant, no API, fully offline)
 *   Python      → Pyodide WebAssembly (in-browser Python, no API needed)
 *   Java/C/C++/PHP → Judge0 CE public API (free, no key required)
 */

// ─── Judge0 public endpoint (no API key needed for reasonable usage) ──────────
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';

// Judge0 language IDs
const JUDGE0_LANG_IDS = {
  java: 62,
  c: 50,
  cpp: 54,
  php: 68,
};

// ─── Pyodide singleton ────────────────────────────────────────────────────────
let pyodideInstance = null;
let pyodideLoading = false;
let pyodideCallbacks = [];

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;

  if (pyodideLoading) {
    // Queue callers while loading
    return new Promise((resolve, reject) => {
      pyodideCallbacks.push({ resolve, reject });
    });
  }

  pyodideLoading = true;

  // Inject Pyodide script if not present
  if (!window.loadPyodide) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  pyodideInstance = await window.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
  });

  // Flush queued callers
  pyodideCallbacks.forEach(cb => cb.resolve(pyodideInstance));
  pyodideCallbacks = [];
  pyodideLoading = false;

  return pyodideInstance;
}

// ─── JavaScript — sandboxed iframe execution ─────────────────────────────────
function runJavaScript(code) {
  return new Promise((resolve) => {
    const logs = [];
    const errors = [];

    // Create a hidden sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts';
    document.body.appendChild(iframe);

    const cleanup = () => {
      try { document.body.removeChild(iframe); } catch {}
    };

    // Listen for messages from the iframe
    const onMessage = (e) => {
      if (e.source !== iframe.contentWindow) return;
      const { type, data } = e.data || {};
      if (type === 'log')   logs.push(data);
      if (type === 'error') errors.push(data);
      if (type === 'done') {
        window.removeEventListener('message', onMessage);
        cleanup();
        if (errors.length > 0) {
          resolve({ output: errors.join('\n'), isError: true });
        } else {
          resolve({ output: logs.join('\n') || '(no output)', isError: false });
        }
      }
    };
    window.addEventListener('message', onMessage);

    // Safety timeout (5 s)
    const timeout = setTimeout(() => {
      window.removeEventListener('message', onMessage);
      cleanup();
      resolve({ output: 'Error: Execution timed out (5s limit).', isError: true });
    }, 5000);

    // Write sandboxed page that intercepts console.log
    const html = `<!DOCTYPE html><html><body><script>
      const _parent = window.parent;
      const _log = (...a) => _parent.postMessage({ type:'log', data: a.map(String).join(' ') }, '*');
      const _err = (msg) => _parent.postMessage({ type:'error', data: String(msg) }, '*');
      console.log = _log;
      console.warn = _log;
      console.error = _err;
      window.onerror = (msg, src, line, col) => {
        _err(msg + (line ? ' (line ' + line + ')' : ''));
        _parent.postMessage({ type:'done' }, '*');
        return true;
      };
      try {
        ${code}
        _parent.postMessage({ type:'done' }, '*');
      } catch(e) {
        _err(e.toString());
        _parent.postMessage({ type:'done' }, '*');
      }
    <\/script></body></html>`;

    // Use blob URL to avoid cross-origin issues
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    iframe.src = blobUrl;

    iframe.onload = () => {
      // Nothing needed — the script runs automatically
      clearTimeout(timeout);
      // Re-arm timeout from when iframe actually loaded
      setTimeout(() => {
        window.removeEventListener('message', onMessage);
        cleanup();
        resolve({ output: 'Error: Execution timed out (5s limit).', isError: true });
      }, 5000);
    };
  });
}

// ─── Python — Pyodide WASM ────────────────────────────────────────────────────
async function runPython(code) {
  try {
    const pyodide = await getPyodide();

    // Capture stdout/stderr via Python's io module
    const wrappedCode = `
import sys
import io
_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
try:
${code.split('\n').map(l => '    ' + l).join('\n')}
except Exception as e:
    import traceback
    print(traceback.format_exc(), file=sys.stderr)
finally:
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
`;

    await pyodide.runPythonAsync(wrappedCode);

    const stdout = pyodide.runPython(`_stdout.getvalue()`);
    const stderr = pyodide.runPython(`_stderr.getvalue()`);

    if (stderr && stderr.trim()) {
      return { output: stderr.trim(), isError: true };
    }
    return { output: stdout.trim() || '(no output)', isError: false };
  } catch (e) {
    return { output: String(e), isError: true };
  }
}

// ─── Judge0 — Java / C / C++ / PHP ───────────────────────────────────────────
async function runWithJudge0(lang, code) {
  const languageId = JUDGE0_LANG_IDS[lang];
  if (!languageId) {
    return { output: `Unsupported language: ${lang}`, isError: true };
  }

  try {
    // Submit
    const submitRes = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: '',
      }),
    });

    if (!submitRes.ok) {
      throw new Error(`Judge0 responded with ${submitRes.status}`);
    }

    const result = await submitRes.json();

    const stdout = result.stdout || '';
    const stderr = result.stderr || '';
    const compileOutput = result.compile_output || '';
    const message = result.message || '';

    if (compileOutput.trim()) {
      return { output: compileOutput.trim(), isError: true };
    }
    if (stderr.trim()) {
      return { output: stderr.trim(), isError: true };
    }
    if (message && result.status?.id > 3) {
      return { output: message, isError: true };
    }
    return { output: stdout.trim() || '(no output)', isError: false };

  } catch (e) {
    return {
      output: `Judge0 API error: ${e.message}\n\nTip: Judge0 requires a free RapidAPI key for Java/C/C++/PHP.\nVisit https://rapidapi.com/judge0-official/api/judge0-ce to get one,\nthen add it to your .env as VITE_RAPIDAPI_KEY.`,
      isError: true,
    };
  }
}

// ─── Main export — routes to the right engine ────────────────────────────────
/**
 * @param {string} lang  - one of: javascript | python | java | c | cpp | php
 * @param {string} code  - source code to execute
 * @param {Function} onStatus - optional callback for status updates e.g. "Loading Python…"
 * @returns {Promise<{ output: string, isError: boolean, engine: string }>}
 */
export async function executeCode(lang, code, onStatus) {
  if (!code.trim()) {
    return { output: '(empty file)', isError: false, engine: 'none' };
  }

  switch (lang) {
    case 'javascript': {
      onStatus?.('Running in sandbox…');
      const result = await runJavaScript(code);
      return { ...result, engine: 'sandbox' };
    }

    case 'python': {
      onStatus?.('Loading Python runtime…');
      const result = await runPython(code);
      return { ...result, engine: 'pyodide' };
    }

    default: {
      onStatus?.(`Sending to Judge0…`);
      const result = await runWithJudge0(lang, code);
      return { ...result, engine: 'judge0' };
    }
  }
}

/**
 * Returns which engine will be used for a given language.
 * Used for UI badges.
 */
export function getEngine(lang) {
  if (lang === 'javascript') return { label: 'Sandbox', color: '#E0A852', icon: 'ti-box' };
  if (lang === 'python')     return { label: 'Pyodide',  color: '#4A9EDE', icon: 'ti-brand-python' };
  return                            { label: 'Judge0',   color: '#C9A84C', icon: 'ti-server' };
}