import { useState, useEffect } from "react";

// ─── Toast ────────────────────────────────────────────────────────────────────
let _tid = 0;
const TC = { toasts:[], listeners:[] };
function useToasts() {
  const [t, setT] = useState([]);
  useEffect(() => { TC.listeners.push(setT); return () => { TC.listeners = TC.listeners.filter(l => l !== setT); }; }, []);
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

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, color, size=36, fontSize="0.85rem" }) {
  const initials = name ? name.trim().split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() : "?";
  return (
    <div style={{ width:size, height:size, borderRadius:4, background:color||"#B5872A", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-display)", fontSize, fontWeight:700, color:"#1A1510", flexShrink:0 }}>
      {initials}
    </div>
  );
}


export default function CollaborationPage({ setPage, setCollabSession }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("name");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const createRoom = e => {
    e.preventDefault();
    const id=`room-${Math.random().toString(36).slice(2,9)}-${Math.random().toString(36).slice(2,9)}`;
    // const id = crypto.randomUUID ? crypto.randomUUID() : 'room-' + Math.random().toString(36).slice(2, 11);
    setRoomId(id);
    toast("Room created — share the ID to invite collaborators");
  };

  const joinRoom = async () => {
    if (!roomId.trim()||!username.trim()) { toast("Room ID and username are required","error"); return; }

    const colors = ["#B5872A", "#C85A54", "#4A7C59", "#6A4C93"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setCollabSession({ 
      roomId: roomId.trim(), 
      username: username.trim(),
      avatarColor: randomColor
    });
    setPage("editor");
  };

  const copyId = async () => { try{await navigator.clipboard.writeText(roomId);toast("Room ID copied");}catch{toast("Could not copy","error");} };


  return (
    <div className="cs-collab-page">
      <ToastContainer />
      <div className="cs-collab-card">
        <h2 className="cs-collab-title">Join a Session</h2>
        <p className="cs-collab-subtitle">
          Create a new room or join an existing one with a Room ID.
        </p>
        {roomId&&(
          <div className="cs-room-info">
            <div><div style={{fontSize:".62rem",textTransform:"uppercase",letterSpacing:".1em",marginBottom:4}}>Your Room ID</div><span className="cs-room-id">{roomId}</span></div>
            <button className="cs-copy-btn" onClick={copyId}>Copy</button>
          </div>
        )}
        <div className="cs-field"><label>Room ID</label><input className="cs-input" placeholder="Paste invitation Room ID" value={roomId} onChange={e=>setRoomId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinRoom()}/></div>
        <div className="cs-field"><label>Username</label><input className="cs-input" placeholder="Your display name" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinRoom()}/></div>
        <button className="cs-auth-submit" onClick={joinRoom}>Enter Room</button>
        <div className="cs-separator"><div className="cs-separator-line"/><span className="cs-separator-text">or</span><div className="cs-separator-line"/></div>
        <p style={{textAlign:"center",fontSize:".875rem",color:"var(--ink-muted)"}}>No invitation? &nbsp;<a className="cs-create-link" onClick={createRoom}>Create a new room</a></p>


      </div>
    </div>
  );
}