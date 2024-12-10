import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Logo from "./CSS/favicon.ico";
import "./CSS/Signup.css";

const Collaboration = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  // Load the username from localStorage when the component mounts
  useEffect(() => {
    const storedUsername = localStorage.getItem("name");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Room created successfully");
    console.log(id);
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("RoomID & Username are required to Join");
      return;
    }
    // Redirect
    // This state is used to transfer the data from this component to where we want to go with username
    navigate(`/collaboration/${roomId}`, { state: { username } });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <div className="nav-logo">
          <img src={Logo} alt="" />
          <p>CodeSphere</p>
        </div>
        <h4 className="mainLabel">Paste invitation Room ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="Room ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username} // Auto-fill the username from localStorage
            onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite, then create &nbsp;
            <a
              onClick={createNewRoom}
              href="/create-room"
              className="createNewBtn"
            >
              Create Room
            </a>
          </span>
        </div>
      </div>
      <footer className="footer">
        <h4>Built with CodeSphere by Tushar Gupta</h4>
      </footer>
    </div>
  );
};

export default Collaboration;
