// src/components/NavBar.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // Adjust the path if needed
import Logo from "../assets/HOR_LOGO.png"; // Ensure this path is correct

function Navbar({ isLoggedIn, username }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img 
            src={Logo} 
            alt="Servio Logo" 
            className="navbar-logo-image" 
          />
        </Link>
      </div>
      
      <div className="navbar-nav">
        <ul className="navbar-links">
          <li>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li>
            <Link to="/module-choice" className="nav-link">Discover</Link>
          </li>
          <li>
            <Link to="/build-registry" className="nav-link">Build Registry</Link>
          </li>
        </ul>
      </div>

      <div className="navbar-auth">
        {isLoggedIn ? (
          <div className="user-section">
            <span className="welcome-text">Welcome, {username}!</span>
            <Link to="/logout" className="auth-button logout-button">Logout</Link>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/signin" className="auth-button signin-button">Sign In</Link>
            <Link to="/signup" className="auth-button signup-button">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;