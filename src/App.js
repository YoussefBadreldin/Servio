// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

  // Check for existing session on component mount
  useEffect(() => {
    const loggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    const email = sessionStorage.getItem("userEmail");
    if (loggedIn && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userEmail");
  };

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} username={userEmail} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Root and /signup are public */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            {/* SignIn route: only accessible if not logged in */}
            <Route 
              path="/signin" 
              element={
                isLoggedIn ? 
                  <Navigate to="/module-choice" replace /> : 
                  <SignIn setIsLoggedIn={setIsLoggedIn} />
              } 
            />
            {/* All other routes are protected */}
            <Route
              path="/module-choice"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <ModuleChoice />
                </ProtectedRoute>
              }
            />
            <Route
              path="/build-registry"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <BuildRegistry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discovery"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Discovery />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registry-choice"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <RegistryChoice />
                </ProtectedRoute>
              }
            />
            {/* Catch all route - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
