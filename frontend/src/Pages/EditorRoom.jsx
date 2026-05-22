import React, { useState, useRef, useEffect } from "react";
import { CODE_SNIPPETS, LANG_VERSIONS, LANG_ICONS } from "../constants";
import { executeCode, getEngine } from "../Services/Executor";
import useSocket from "../Services/useSocket";

// ─── Toast (same instance as CollaborationPage) ───────────────────────────────
let _tid = 0;
const TC = { toasts:[], listeners:[] };
function useToasts() {
  const [t, setT] = useState([]);
  React.useEffect(() => { TC.listeners.push(setT); return () => { TC.listeners = TC.listeners.filter(l => l !== setT); }; }, []);
  return t;
}
function toast(msg, type="success") {
  const id = ++_tid;
  TC.toasts = [...TC.toasts, { id, msg, type }];
  TC.listeners.forEach(f => f([...TC.toasts]));
  setTimeout(() => { TC.toasts = TC.toasts.filter(t => t.id !== id); TC.listeners.forEach(f => f([...TC.toasts])); }, 3500);
}
function ToastContainer() {
  const toasts = useToasts();
  return (
    <div className="cs-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`cs-toast cs-toast-${t.type}`}>
          <span className="cs-toast-icon">{t.type==="success"?"✓":"✕"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────────────
function Spinner({ size=14, border=2, light=false }) {
  return (
    <span style={{
      display:"inline-block", width:size, height:size,
      border:`${border}px solid ${light?"rgba(255,255,255,0.3)":"rgba(0,0,0,0.15)"}`,
      borderTopColor: light?"#fff":"#8B6914",
      borderRadius:"50%", animation:"cs-spin 0.6s linear infinite", verticalAlign:"middle",
    }}/>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, color, size=36, fontSize="0.85rem" }) {
  const initials = name ? name.trim().split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:color||"#B5872A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize, fontWeight:700, color:"#1A1510", flexShrink:0 }}>
      {initials}
    </div>
  );
}


export default function EditorRoomPage({ session, setPage, profile }) {
  const initLang = profile?.preferredLang || "Python";
  const [language, setLanguage] = useState(initLang);
  const [code, setCode]         = useState(CODE_SNIPPETS[initLang]);
  const [termLines, setTermLines] = useState([
    { cls:"cs-tline-info", text:"CodeSphere Terminal — ready" },
    { cls:"cs-tline-sep",  text:"─────────────────────────" },
  ]);
  const [termLoading, setTermLoading] = useState(false);
  const termRef = useRef(null);
 
  // ── Live socket — real-time code & language sync ──────────────────────────
  const handleRemoteCodeChange = useCallback((incoming) => {
    setCode(incoming);
  }, []);
 
  const handleRemoteLangChange = useCallback((incoming) => {
    setLanguage(incoming);
    setCode(CODE_SNIPPETS[incoming]);
  }, []);
 
  const handleUserJoin = useCallback((joinedUser) => {
    toast(`${joinedUser} joined the room`);
  }, []);

  const handleUserLeave = useCallback((leftUser) => {
    toast(`${leftUser} left the room`, "error");
  }, []);
 
  const { clients, emitCodeChange, emitLangChange } = useSocket({
    roomId:       session.roomId,
    username:     session.username,
    onCodeChange: handleRemoteCodeChange,
    onLangChange: handleRemoteLangChange,
    onUserJoin:   handleUserJoin,
    onUserLeave:  handleUserLeave,
  });
 
  const scrollTerm = () => setTimeout(() => { if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight; }, 40);
 
  const onLangChange = e => {
    const l = e.target.value;
    setLanguage(l);
    setCode(CODE_SNIPPETS[l]);
    emitLangChange(l);          // broadcast language switch to all room clients
  };
 
  const handleTab = e => {
    if (e.key !== "Tab") return; e.preventDefault();
    const s = e.target.selectionStart;
    setCode(code.substring(0,s) + "    " + code.substring(e.target.selectionEnd));
    setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = s+4; }, 0);
  };
 
  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    emitCodeChange(val);        // broadcast keystrokes to all room clients
  };
 
  // ── Hybrid execution — JS→iframe, Python→Pyodide, rest→Judge0 ─────────────
  const runCode = async () => {
    if (!code.trim() || termLoading) return;
    setTermLoading(true);
 
    const ts = new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
    const eng = getEngine(language);
 
    setTermLines(prev => [
      ...prev,
      { cls:"cs-tline-sep",    text:"" },
      { cls:"cs-tline-prompt", text:`[${ts}] $ run ${language}` },
      { cls:"cs-tline-info",   text:`${eng.label} engine…` },
    ]);
    scrollTerm();
 
    const { output, isError } = await executeCode(
      language,
      code,
      (msg) => {
        setTermLines(prev => [...prev, { cls:"cs-tline-info", text:msg }]);
        scrollTerm();
      },
    );
 
    if (isError) {
      setTermLines(prev => [
        ...prev,
        ...output.trim().split("\n").filter(Boolean).map(t => ({ cls:"cs-tline-error", text:t })),
        { cls:"cs-tline-error", text:"✕ Exited with error" },
      ]);
    } else {
      const lines = output.trim().split("\n");
      setTermLines(prev => [
        ...prev,
        ...(output.trim()
          ? lines.map(t => ({ cls:"cs-tline-output", text:t }))
          : [{ cls:"cs-tline-info", text:"(no output)" }]
        ),
        { cls:"cs-tline-success", text:"✓ Done" },
      ]);
    }
 
    setTermLoading(false);
    scrollTerm();
  };
 
  const copyRoomId = async () => { try { await navigator.clipboard.writeText(session.roomId); toast("Room ID copied"); } catch { toast("Could not copy","error"); } };

  return (
    <div className="cs-editor-page">
      <ToastContainer />
      <aside className="cs-sidebar">
        <p className="cs-sidebar-section-title">Connected</p>
        <div className="cs-client-list">
          {clients.map(c => (
            <div key={c.id} className="cs-client-item">
              <Avatar name={c.username} color={c.color} size={30} fontSize=".7rem"/>
              <span className="cs-client-name">{c.username}</span>
              <div className="cs-online-dot"/>
            </div>
          ))}
        </div>
        <div className="cs-sidebar-actions">
          <button className="cs-sidebar-btn cs-sidebar-btn-copy" onClick={copyRoomId}>Copy Room ID</button>
          <button className="cs-sidebar-btn cs-sidebar-btn-leave" onClick={() => setPage("collaboration")}>Leave Room</button>
        </div>
      </aside>

      <div className="cs-collab-editor-wrap">
        <div className="cs-editor-section">
          <div className="cs-panel-header">
            <div className="cs-panel-dot cs-panel-dot-amber"/>
            <span className="cs-panel-title">collaborative editor — {language}</span>
            <select className="cs-sidebar-lang-select" value={language} onChange={onLangChange} style={{marginLeft:"auto", marginRight:"0.5rem"}}>
              {Object.entries(LANG_VERSIONS).map(([l,v]) => <option key={l} value={l}>{LANG_ICONS[l]}  {l}  ({v})</option>)}
            </select>
            <span style={{fontFamily:"var(--font-code)",fontSize:".65rem",color:"#4A3E30"}}>{session.roomId}</span>
          </div>
          <textarea className="cs-collab-editor-textarea" value={code} onChange={handleCodeChange} onKeyDown={handleTab} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off" style={{flex:1}}/>
          <div className="cs-collab-editor-footer">
            <span className="cs-status-dot"/><span>Connected</span>
            <span style={{marginLeft:"auto"}}>{language} · UTF-8 · LF</span>
          </div>
        </div>

        <div className="cs-terminal-panel">
          <div className="cs-terminal-header">
            <span className="cs-terminal-title">▶ Terminal</span>
            <button className="cs-terminal-btn" onClick={() => setTermLines([{ cls:"cs-tline-info", text:"Terminal cleared." }])}>✕ Clear</button>
            <button className="cs-terminal-btn cs-terminal-btn-run" onClick={runCode} disabled={termLoading}>
              {termLoading ? <><Spinner size={11} border={1.5} light/>&nbsp;Running</> : <>▶ Run</>}
            </button>
          </div>
          <div className="cs-terminal-body" ref={termRef}>
            {termLines.map((l,i) => <span key={i} className={`cs-tline ${l.cls}`}>{l.text}</span>)}
            {termLoading && <div className="cs-terminal-spinner"><Spinner size={11} border={1.5}/>Running…</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
