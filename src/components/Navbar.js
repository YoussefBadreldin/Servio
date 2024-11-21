// src/Navbar.js
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
      <ul className="navbar-links">
        {isLoggedIn ? (
          <>
            <li>Welcome, {username}!</li>
            <li>
              <Link to="/logout">Logout</Link>
            </li>
          </>
        ) : (
          <li>
            <Link to="/signin">Sign In</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
