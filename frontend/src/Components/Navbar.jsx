import React from "react";

export default function Navbar({ page, setPage }) {
  return (
    <nav className="cs-nav">
      <div className="cs-nav-logo" onClick={() => setPage("home")}>
        <div className="cs-nav-logo-icon">⟨/⟩</div>
        <span className="cs-nav-logo-text">CodeSphere</span>
      </div>
      <ul className="cs-nav-links">
        <li><a className={page === "home" ? "active" : ""} onClick={() => setPage("home")}>Home</a></li>
        <li><a className={page === "compiler" ? "active" : ""} onClick={() => setPage("compiler")}>Editor</a></li>
        <li><a className={page === "collaboration" ? "active" : ""} onClick={() => setPage("collaboration")}>Collaborate</a></li>
        <li><a className={page === "about" ? "active" : ""} onClick={() => setPage("about")}>About</a></li>
      </ul>
    </nav>
  );
}