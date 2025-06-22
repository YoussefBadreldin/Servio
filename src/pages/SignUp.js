// src/pages/SignUp.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/SignUp.css';
import GoogleLogo from "../assets/google-logo.png"; // Adjusted import paths
import FacebookLogo from "../assets/facebook-logo.png";
import AppleLogo from "../assets/applelogo.png";
import useScrollToTop from "../hooks/useScrollToTop";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Fixed typo: "Confermpassword" to "confirmPassword"
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();
  useScrollToTop();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Name:", name,
      "Email:", email,
      "Password:", password,
      "Phone:", phone,
      "Confirm Password:", confirmPassword
    );

    // Add your sign-up logic here

    navigate("/Home");
  };

  return (
    <div className="signup-container">
      <h2>Create a New Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
        <div className="footer-links">
          <Link to="/signin">Have an account? Sign In</Link>
        </div>
      </form>

      <div className="social-login">
        <img
          src={GoogleLogo}
          alt="Sign up with Google"
          onClick={() => console.log("Google login")}
        />
        <img
          src={FacebookLogo}
          alt="Sign up with Facebook"
          onClick={() => console.log("Facebook login")}
        />
        <img
          src={AppleLogo}
          alt="Sign up with Apple"
          onClick={() => console.log("Apple login")}
        />
      </div>
    </div>
  );
}

export default SignUp;
