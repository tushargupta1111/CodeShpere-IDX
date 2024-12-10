import React, { useState, useEffect } from "react";
import "./Navbar.css";
import Logo from "../Navbar/favicon.ico";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  // Check if the user is logged in by checking localStorage
  useEffect(() => {
    const user = localStorage.getItem("name"); // Assuming "name" is saved in localStorage on login
    if (user) {
      setLoggedInUser(user);
    }
  }, []);

  // Logout function to clear the user data and navigate to home page
  const logoutHandler = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("auth-token");
    setLoggedInUser(null);
    navigate("/"); // Redirect to the home page after logout
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={Logo} alt="Logo" />
        <p>CodeSphere</p>
      </div>
      <ul className="nav-links">
        <li>
          <a href="/">Home</a>
        </li>
        <li>
          <a href="editor">Editor</a>
        </li>
        <li>
          <a href="/collaboration">Collaboration</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
      </ul>

      <ul className="nav-links">
        {loggedInUser ? (
          // If user is logged in, show the username and a logout button
          <>
            <li className="username-display">
              <p>Welcome, {loggedInUser}</p>
            </li>
            <li>
              <button className="nav-button logout-btn" onClick={logoutHandler}>
                Logout
              </button>
            </li>
          </>
        ) : (
          // If user is not logged in, show Sign Up and Login buttons
          <>
            <li>
              <Link to={"/signup"}>
                <button className="nav-button signup-btn">Sign Up</button>
              </Link>
            </li>
            <li>
              <Link to={"/login"}>
                <button className="nav-button login-btn">Login</button>
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
