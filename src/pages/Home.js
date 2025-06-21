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
            services you need through intelligent semantic matching and AI-powered assistance.
          </p>
        </div>
      </section>

      {/* Discovery Modules Section */}
      <section className="modules-section">
        <h2>Discovery Modules</h2>
        <div className="modules-grid">
          <div className="module-card">
            <h3>🎯 Direct Module</h3>
            <p>Precise aspect-based service discovery with advanced filtering</p>
            <ul>
              <li>Submit queries with Aspects XML files or manual input</li>
              <li>Smart aspect suggestions and validation</li>
              <li>Semantic matching with ranked results</li>
              <li>LLM-powered query refinement for better results</li>
            </ul>
          </div>
          <div className="module-card">
            <h3>🤖 Guided Module</h3>
            <p>AI-powered conversational service discovery</p>
            <ul>
              <li>RAG-based chatbot for natural interaction</li>
              <li>Support for XML, JSON, UML diagrams, and PDF uploads</li>
              <li>Intelligent service ranking and recommendations</li>
              <li>Interactive refinement through clarifying questions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Multi-Registry Support</h3>
            <p>Use SERVIO registry or create custom registries for your specific needs</p>
          </div>
          <div className="feature-card">
            <h3>Intelligent Discovery</h3>
            <p>Find services using natural language queries and advanced semantic matching</p>
          </div>
          <div className="feature-card">
            <h3>File Upload Support</h3>
            <p>Upload XML, JSON, UML diagrams, and PDF documents for enhanced discovery</p>
          </div>
          <div className="feature-card">
            <h3>Smart Refinement</h3>
            <p>AI-powered query refinement and aspect suggestions for better results</p>
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
            <p>Select between Direct (aspect-based) or Guided (conversational) discovery</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Select Registry</h3>
            <p>Use SERVIO registry or create/build your own custom registry</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Start Discovery</h3>
            <p>Submit queries with aspects or chat with AI to find services</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Refine & Explore</h3>
            <p>Get ranked results and refine your search for better matches</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Discover Services?</h2>
        <p>Choose your preferred discovery method and start exploring</p>
        <button 
          className="cta-button"
          onClick={() => navigate("/module-choice")}
        >
          Start Discovery
        </button>
      </section>
    </div>
  );
}

export default Home;