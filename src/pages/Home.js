// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import useScrollToTop from "../hooks/useScrollToTop";

function Home() {
  const navigate = useNavigate();
  useScrollToTop();

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Servio</h1>
          <p className="hero-subtitle">Your Intelligent Service Discovery Platform</p>
          <button 
            className="cta-button"
            onClick={() => navigate("/module-choice")}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <h2>About Servio</h2>
        <div className="about-content">
          <p>
            Servio is a powerful platform that helps you discover and manage services
            across different registries. Whether you're working with Docker, Kubernetes,
            or custom registries, Servio makes it easy to find and interact with the
            services you need.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Multi-Registry Support</h3>
            <p>Connect to Docker Hub, Kubernetes, and custom registries seamlessly</p>
          </div>
          <div className="feature-card">
            <h3>Intelligent Discovery</h3>
            <p>Find services using natural language queries and advanced search</p>
          </div>
          <div className="feature-card">
            <h3>Custom Registry Building</h3>
            <p>Create and manage your own service registries with ease</p>
          </div>
          <div className="feature-card">
            <h3>Smart Filtering</h3>
            <p>Filter services by type, tags, and other metadata</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Choose Your Module</h3>
            <p>Select between discovery or registry building</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Select Registry</h3>
            <p>Pick from available registries or create your own</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Start Exploring</h3>
            <p>Discover services or manage your registry</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Begin your service discovery journey today</p>
        <button 
          className="cta-button"
          onClick={() => navigate("/module-choice")}
        >
          Start Now
        </button>
      </section>
    </div>
  );
}

export default Home;