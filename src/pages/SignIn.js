// src/pages/SignIn.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignIn.css";
import FacebookLogo from "../assets/facebook-logo.png";
import GoogleLogo from "../assets/google-logo.png";
import AppleLogo from "../assets/applelogo.png";
import useScrollToTop from "../hooks/useScrollToTop";

function SignIn({ setIsLoggedIn, setUserEmail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  useScrollToTop();

  // Check for saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (email === "youssefmbadreldin@gmail.com" && password === "12345") {
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // Set login state
      setIsLoggedIn(true);
      setUserEmail(email);
      // Store in session
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userEmail", email);

      navigate("/module-choice");
    } else {
      setError("Invalid email or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="show-password-btn"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <div className="form-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </div>
        <button type="submit">Sign In</button>
        <div className="footer-links">
          <Link to="/signup">Don't have an account? Sign Up</Link>
        </div>
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
    </div>
  );
}

export default SignIn;
