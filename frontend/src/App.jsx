import React, { useState } from "react";
import Navbar from "./Components/Navbar";
import HomePage from "./Pages/HomePage";
import CompilerPage from "./Pages/CompilerPage";
import CollaborationPage from "./Pages/CollaborationPage";
import EditorRoom from "./Pages/EditorRoom";
import AboutPage from "./Pages/AboutPage";

export default function App() {
  const [page, setPage] = useState("home");
  const [collabSession, setCollabSession] = useState(null);
  const noNav = [];

  return (
    <div className="cs-app">
      {!noNav.includes(page) && <Navbar page={page} setPage={setPage} />}
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "compiler" && <CompilerPage />}
      {page === "collaboration" && <CollaborationPage setPage={setPage} setCollabSession={setCollabSession} />}
      {page === "editor" && collabSession && <EditorRoom session={collabSession} setPage={setPage} />}
      {page === "about" && <AboutPage />}
    </div>
  );
}