// src/App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ServiceDiscovery from "./pages/ServiceDiscovery"; // Import the Chatbot component
import Navbar from "./components/Navbar";

function App() {
  const [message, setMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((response) => {
        setMessage(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

    setUserProfile({ role: "admin" });
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar userProfile={userProfile} />
        <h1>{message}</h1>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/ServiceDiscovery" element={<ServiceDiscovery />} /> {/* Add Chatbot route */}
          <Route path="/admin" element={<div>Admin Page</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
