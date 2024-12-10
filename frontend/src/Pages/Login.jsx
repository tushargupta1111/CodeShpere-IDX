import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast"; // Import toast for notifications
import Logo from "./CSS/favicon.ico";
import "./CSS/Signup.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    console.log("Login Function Executed", formData);
    let responseData;
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          Accept: "application/json", // Corrected Accept header for JSON
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      responseData = await response.json();

      if (response.ok && responseData.success) {
        // Success Notification
        toast.success("Login successful! Redirecting...");

        localStorage.setItem("name", responseData.user.name);
        localStorage.setItem("auth-token", responseData.token);

        setTimeout(() => {
          window.location.replace("/");
        }, 1500); // Slight delay for a better user experience
      } else {
        // Specific toast for invalid credentials (wrong email or password)
        if (responseData.message === "Invalid credentials") {
          toast.error("Incorrect email or password.");
        } else {
          // General error toast for other response failures
          toast.error(
            responseData.message || "Login failed. Please try again."
          );
        }
      }
    } catch (error) {
      // Error Notification for unexpected errors
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <div className="nav-logo">
          <img src={Logo} alt="" />
          <p>CodeSphere</p>
        </div>
        <h4 className="mainLabel">Welcome Back</h4>
        <div className="inputGroup">
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
          <button className="btn joinBtn" onClick={login}>
            Login
          </button>
          <span className="createInfo">
            Don't have an account? &nbsp;
            <Link to={"/signup"} className="createNewBtn">
              Sign Up
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

export default Login;
