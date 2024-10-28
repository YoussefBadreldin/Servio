// src/pages/Home.js
import React from "react";
import '../styles/Home.css'; // Should match the file name
import { Link } from "react-router-dom"; // Import Link for navigation

function Home() {
  return (
    <div className="container">
      <h1>Welcome to Servio</h1>
      <p>Your smart assistant for efficient service discovery.</p>
      <p>Optimize code reuse and streamline your development process!</p>
      {/* Start Now button pointing to Sign In */}
      <Link to="/signin">
        <button className="start-now-button">Start Now</button>
      </Link>
    </div>
  );
}

export default Home;
