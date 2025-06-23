// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './app.css'; 

import Home from "./pages/Home";
import ModuleChoice from "./pages/ModuleChoice";
import RegistryChoice from "./pages/RegistryChoice";
import BuildRegistry from "./pages/BuildRegistry";
import Discovery from "./pages/Discovery";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const email = sessionStorage.getItem("userEmail");
    if (loggedIn && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userEmail");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} username={userEmail} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} setUserEmail={setUserEmail} />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/module-choice" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <ModuleChoice />
              </ProtectedRoute>
            } />
            <Route path="/build-registry" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <BuildRegistry />
              </ProtectedRoute>
            } />
            <Route path="/discovery" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Discovery />
              </ProtectedRoute>
            } />
            <Route path="/registry-choice" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <RegistryChoice />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
