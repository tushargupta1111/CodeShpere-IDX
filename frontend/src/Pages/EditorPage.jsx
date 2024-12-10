import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import "./CSS/EditorPage.css";
import ACTIONS from "../Actions";
import Client from "../Components/Collaboration/Client";
import Editor from "../Components/Collaboration/Editor";
import { initSocket } from "../socket";
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom";
import Logo from './CSS/favicon.ico';

const EditorPage = () => {
  // useRef is used when we don't want to re-render our component when value changes
  const socketRef = useRef(null);
  // to get the code from child component Editor
  const codeRef = useRef(null);
  // to fetch the state data from Home page
  const location = useLocation();
  // to navigate
  const reactNavigator = useNavigate();
  // fetch the roomId from the url of the page using Route in  App.js file
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator('/');
      }
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, { code: codeRef.current, socketId, });
        });

      // Listening for disconnected
      socketRef.current.on(
        ACTIONS.DISCONNECTED,
        ({socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
        });

    }
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    };
  }, []);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to your clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  }

  const leaveRoom = () => {
    reactNavigator('/');
  }


  if (!location.state)
    return <Navigate to="/" />

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
        <div className="nav-logo">
          <img src={Logo} alt="" />
          <p>CodeSphere</p>
        </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((clients) => (
              <Client key={clients.socketId} username={clients.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy Room ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editorWrap">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={(code) => {codeRef.current = code;}}/> 
      </div>
    </div>
  );
};

export default EditorPage;
