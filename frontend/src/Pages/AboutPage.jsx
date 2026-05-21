import React from "react";

export default function AboutPage({ setPage }) {
  const tech = [
    { label: "Frontend",       value: "React.js",          desc: "Hooks, state, component architecture" },
    { label: "JS Execution",   value: "Sandboxed iframe",  desc: "Instant in-browser execution, no API" },
    { label: "Python Runtime", value: "Pyodide (WASM)",    desc: "Full CPython compiled to WebAssembly" },
    { label: "Java/C/C++/PHP", value: "Judge0 CE API",     desc: "Free public sandboxed compiler API" },
    { label: "Real-Time",      value: "Socket.IO",         desc: "WebSocket collaboration layer" },
    { label: "Backend",        value: "Node + Express",    desc: "REST endpoints and socket server" },
  ];

  const steps = [
    {
      title: "Open the Editor",
      desc: <>Navigate to <strong>Compiler</strong>. Select your language from the dropdown — the engine badge in the toolbar shows exactly how your code will be executed (<em>Sandbox</em>, <em>Pyodide</em>, or <em>Judge0</em>).</>
    },
    {
      title: "Run Your Code",
      desc: <>Click <strong>▶ Run Code</strong>. JavaScript runs instantly in a sandboxed iframe, Python loads via WebAssembly, and Java/C/C++/PHP are sent to Judge0. The output panel shows stdout in green and stderr in red with a clear success/error badge.</>
    },
    {
      title: "Collaborate",
      desc: <>Go to <strong>Collaboration</strong>. Enter a username, then click <strong>Generate</strong> to create a new room or paste an existing Room ID to join. Share the Room ID with teammates — they join instantly.</>
    },
    {
      title: "Use the Terminal",
      desc: <>Inside a collaboration room, the bottom panel is a live terminal. Click <strong>▶ Run Code</strong> in the toolbar to execute the shared code — output streams directly into the terminal. Type shell commands (<code>help</code>, <code>ls</code>, <code>whoami</code>, <code>clear</code>) anytime.</>
    },
  ];

  return (
    <div className="cs-about">
      <div className="cs-about-hero">
        <p className="cs-about-hero-label">◆ &nbsp;About This Project&nbsp; ◆</p>
        <h1>Built to <span>Elevate</span> the Craft</h1>
        <p>CodeSphere is a browser-based collaborative IDE — elegant in form, powerful in function, with a hybrid execution engine that runs JavaScript and Python entirely in the browser.</p>
      </div>

      <div className="cs-about-body">
        <div className="cs-about-section">
          <span className="cs-section-label">Overview</span>
          <h2>What is CodeSphere?</h2>
          <p>CodeSphere is a full-stack web application for writing, executing, and collaborating on code in the browser. It supports six languages and real-time multi-user editing over WebSockets. A hybrid execution engine routes each language to the fastest and most reliable runner available — no single point of failure.</p>
          <div className="cs-callout">
            <p>💡 <strong>No Piston dependency.</strong> JavaScript runs in a sandboxed iframe, Python runs via Pyodide WebAssembly — both work completely offline. Java, C, C++, and PHP are handled by the free Judge0 CE API.</p>
          </div>
        </div>

        <div className="cs-about-section">
          <span className="cs-section-label">Technology</span>
          <h2>How It's Built</h2>
          <div className="cs-tech-grid">
            {tech.map(t => (
              <div key={t.value} className="cs-tech-card">
                <div className="cs-tech-card-label">{t.label}</div>
                <div className="cs-tech-card-value">{t.value}</div>
                <div className="cs-tech-card-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-about-section">
          <span className="cs-section-label">User Guide</span>
          <h2>How to Use CodeSphere</h2>
          <div className="cs-steps">
            {steps.map((s, i) => (
              <div key={i} className="cs-step">
                <div className="cs-step-num">{i + 1}</div>
                <div className="cs-step-content">
                  <div className="cs-step-title">{s.title}</div>
                  <div className="cs-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-about-section">
          <span className="cs-section-label">Reference</span>
          <h2>Shortcuts & Tips</h2>
          <div className="cs-shortcut-grid">
            {[
              ["Tab in editor",       "4-space indent"],
              ["Engine badge",        "Shows active execution engine"],
              ["Generate Room ID",    "Create a new collaboration room"],
              ["Copy Room ID",        "Share with teammates to join"],
              ["Terminal → help",     "List available shell commands"],
              ["Terminal → clear",    "Wipe terminal output"],
            ].map(([k, v]) => (
              <div key={k} className="cs-shortcut-row">
                <span className="cs-shortcut-label">{v}</span>
                <span className="cs-kbd">{k}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-about-cta">
          <p>Ready? &nbsp;<a onClick={() => setPage("compiler")}>Open the Editor</a>&nbsp; or &nbsp;<a onClick={() => setPage("collab")}>Start Collaborating</a></p>
        </div>
      </div>
    </div>
  );
}