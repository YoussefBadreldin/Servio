// src/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // Adjust the path if needed

function Navbar({ isLoggedIn, username }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Servio</Link>
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
