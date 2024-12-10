import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast"; // Importing toast from react-hot-toast
import Logo from "./CSS/favicon.ico";
import "./CSS/Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const signup = async () => {
    console.log("Signup Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => responseData = data);

    if (responseData.success) {
      // Display success notification
      toast.success('Signup successful!');
      
      localStorage.setItem('auth-token', responseData.token);
      setTimeout(() => {
        window.location.replace("/login");
      }, 1500); // Adding a slight delay before redirecting
    } else {
      // Display error notification
      toast.error(responseData.errors || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <div className="nav-logo">
          <img src={Logo} alt="Logo" />
          <p>CodeSphere</p>
        </div>
        <h4 className="mainLabel">Create Account</h4>
        <div className="inputGroup">
          <input
            type="text"
            value={formData.name}
            name="name"
            onChange={changeHandler}
            className="inputBox"
            placeholder="Your Name"
          />
          <input
            type="email"
            value={formData.email}
            name="email"
            onChange={changeHandler}
            className="inputBox"
            placeholder="Email Address"
          />
          <input
            type="password"
            value={formData.password}
            name="password"
            onChange={changeHandler}
            className="inputBox"
            placeholder="Password"
          />
          <button className="btn joinBtn" onClick={signup}>
            Sign Up
          </button>
          <span className="createInfo">
            Already have an account? &nbsp;
            <Link to={"/login"} className="createNewBtn">
              Login
            </Link>
          </span>
        </div>
      </div>
      <footer className="footer">
        <h4>Built with CodeSphere by Tushar Gupta</h4>
      </footer>
    </div>
  );
};

export default Signup;
