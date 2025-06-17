// src/pages/SignIn.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignIn.css";
import FacebookLogo from "../assets/facebook-logo.png";
import GoogleLogo from "../assets/google-logo.png";
import AppleLogo from "../assets/applelogo.png";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);

    // Navigate to Home after handling logic
    navigate("/Home"); 
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="forgot-password">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        <button type="submit">Sign In</button>
      </form>

      <div className="social-login">
        <img
          src={GoogleLogo}
          alt="Sign in with Google"
          onClick={() => console.log("Google login")}
        />
        <img
          src={FacebookLogo}
          alt="Sign in with Facebook"
          onClick={() => console.log("Facebook login")}
        />
        <img
          src={AppleLogo}
          alt="Sign in with Apple"
          onClick={() => console.log("Apple login")}
        />
      </div>

      <div className="footer-links">
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </div>
    </div>
  );
}

export default SignIn;
