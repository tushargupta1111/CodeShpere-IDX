import React from "react";

export default function HomePage({ setPage }) {
  const features = [
    { icon:"⚡", title:"Real-Time Collaboration", desc:"Work with your team in synchrony — every keystroke reflected instantly across all connected editors." },
    { icon:"🌐", title:"Multiple Languages", desc:"Python, JavaScript, Java, C/C++, and PHP — a unified workspace for every tongue of the machine." },
    { icon:"⚙", title:"Hybrid Execution", desc:"JavaScript runs in a sandboxed iframe, Python via Pyodide WASM, and Java/C/C++/PHP through Judge0 — no single point of failure." },
    { icon:"▶", title:"Compile & Execute", desc:"Run code instantly in the browser — swift, sandboxed, no local setup needed." },
  ];

  
  return (
    <div className="cs-home">
      <section className="cs-hero">
        <p className="cs-hero-ornament">◆ &nbsp;Professional IDE&nbsp; ◆</p>
        <h1>Where Code Meets <span>Craft</span></h1>
        <div className="cs-hero-divider">
          <div className="cs-hero-divider-line"/>
          <span className="cs-hero-divider-diamond">◆</span>
          <div className="cs-hero-divider-line"/>
        </div>
          <p>A distinguished platform for collaborative coding — elegant in form, powerful in function, built for those who take their craft seriously.</p>
        <div className="cs-hero-actions">
          <button className="cs-btn cs-btn-gold" onClick={() => setPage("compiler")}>Open Editor</button>
          <button className="cs-btn cs-btn-outline" onClick={() => setPage("collaboration")}>Start Session</button>
        </div>
      </section>
      <section className="cs-features">
        <div className="cs-section-header">
          <span className="cs-section-label">Capabilities</span>
          <h2 className="cs-section-title">Crafted for Excellence</h2>
          <div className="cs-section-rule"><div className="cs-section-rule-line"/><div className="cs-section-rule-dot"/><div className="cs-section-rule-line"/></div>
        </div>
        <div className="cs-feature-grid">
          {features.map(f => (
            <div key={f.title} className="cs-feature-card">
              <span className="cs-feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="cs-footer">
        <p>© 2024 CodeSphere. All rights reserved.</p>
        <p style={{marginTop:".35rem"}}>A creation by Tushar Gupta &nbsp;·&nbsp; <a href="mailto:Tusharkumargupta1111@gmail.com">Tusharkumargupta1111@gmail.com</a></p>
      </footer>
    </div>
  );
}