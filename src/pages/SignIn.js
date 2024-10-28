// src/pages/SignIn.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/SignIn.css"; // Ensure this file name matches exactly

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Initialize useNavigate
  const navigate = useNavigate(); 

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(
      "Email:",
      email,
      "Password:",
      password,
    );

    // After handling logic, navigate to ServiceDiscovery page
    navigate("/servicediscovery"); 
  };

  return (
    <div className="signin-container">
      <h2> Sign In</h2>
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
        <button type="submit">Sign In</button>
      </form>

      <div className="social-login">
        <img
          src="/frontendsrc/Google__G__logo.svg.png"
          alt="Sign in with Google"
          onClick={() => console.log("Google login")}
        />
        <img
          src="/assets/facebook-logo.png"
          alt="Sign in with Facebook"
          onClick={() => console.log("Facebook login")}
        />
        <img
          src="/assets/apple-logo.png"
          alt="Sign in with Apple"
          onClick={() => console.log("Apple login")}
        />
      </div>

      <div className="footer-links">
        <a href="/forgot-password">Forgot Password?</a>
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </div>
    </div>
  );
}

export default SignIn;
