import React, { useState } from "react";
import { CODE_SNIPPETS, LANG_VERSIONS, LANG_ICONS } from "../constants";
import { executeCode } from "../Services/Executor";

export default function CompilerPage({}) {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(CODE_SNIPPETS["python"]);
  const [output, setOutput] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onLangChange = e => { const l=e.target.value; setLanguage(l); setCode(CODE_SNIPPETS[l]); setOutput(null); setIsError(false); };

  const loadSnippet = e => {
    const idx = parseInt(e.target.value);
    if (isNaN(idx)) return;
    const s = snippets[idx];
    setLanguage(s.language);
    setCode(s.code);
    setOutput(null);
    e.target.value = "";
  };

  const handleTab = e => {
    if (e.key!=="Tab") return;
    e.preventDefault();
    const s=e.target.selectionStart;
    const nc=code.substring(0,s)+"    "+code.substring(e.target.selectionEnd);
    setCode(nc);
    setTimeout(()=>{e.target.selectionStart=e.target.selectionEnd=s+4;},0);
  };

  const runCode = async () => {
    if (!code.trim()) return;
    setIsLoading(true); setOutput(null);
    const { output: result, isError: err } = await executeCode(language, code);
    setOutput(result.split("\n"));
    setIsError(err);
    setIsLoading(false);
  };


  return (
    <div className="cs-compiler-page">
      <div className="cs-compiler-toolbar">
        <span className="cs-toolbar-label">Language</span>
        <select className="cs-lang-select" value={language} onChange={onLangChange}>
          {Object.entries(LANG_VERSIONS).map(([l,v]) => <option key={l} value={l}>{LANG_ICONS[l]} {l} ({v})</option>)}
        </select>
        <div className="cs-toolbar-spacer"/>
        <button className="cs-run-btn" onClick={runCode} disabled={isLoading}>
          {isLoading?<>&nbsp;Running…</>:<>▶&nbsp;Run Code</>}
        </button>
        <span className="cs-toolbar-info">v{LANG_VERSIONS[language]}</span>
      </div>
      <div className="cs-editor-area">
        <div className="cs-editor-panel">
          <div className="cs-panel-header">
            <div className="cs-panel-dot cs-panel-dot-amber"/>
            <span className="cs-panel-title">editor — {language}</span>
          </div>
          <textarea className="cs-editor-textarea" value={code} onChange={e=>setCode(e.target.value)} onKeyDown={handleTab} spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"/>
        </div>
        <div className="cs-output-panel">
          <div className="cs-panel-header" style={{background:"#F0EDE6",borderBottom:"1px solid #D4C9B0"}}>
            <div className="cs-panel-dot" style={{background:isError?"#8B1A1A":"#2E6B3E"}}/>
            <span className="cs-panel-title" style={{color:"#8B7355"}}>output</span>
            {output&&!isLoading&&<span style={{marginLeft:"auto",fontSize:".68rem",color:isError?"#8B1A1A":"#2E6B3E",fontFamily:"var(--font-code)",textTransform:"uppercase",letterSpacing:".1em"}}>{isError?"✕ Error":"✓ Success"}</span>}
          </div>
          <div className={`cs-output-content${isError?" is-error":""}`}>
            {isLoading?<div className="cs-output-loading">Executing {language} code…</div>
              :output?output.map((l,i)=><span key={i} className="cs-output-line">{l||" "}</span>)
              :<span className="cs-output-placeholder">▶&nbsp;Press Run Code to see output here</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
