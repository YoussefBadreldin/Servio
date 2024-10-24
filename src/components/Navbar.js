// src/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // Adjust the path if needed

function Navbar({ userProfile }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Servify</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/signin">Sign In</Link>
        </li>
        <li>
          <Link to="/signup">Sign Up</Link>
        </li>
        <li>
          <Link to="/chatbot">Chatbot</Link> {/* Add Chatbot link */}
        </li>
        {/* Show AdminPage link only if the user is an admin */}
        {userProfile && userProfile.role === "admin" && (
          <li>
            <Link to="/admin">About Servify</Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
