// src/pages/ServiceDiscovery.js
import React, { useState } from "react";
import "../styles/ServiceDiscovery.css";
import ChatBot from "../components/ChatBot.js"; // Ensure ChatBot is imported

const services = [
  { id: 1, name: "User Management Service", category: "Core Banking", description: "Handles user registration and authentication." },
  { id: 2, name: "Account Management Service", category: "Core Banking", description: "Manages bank accounts and account transactions." },
  { id: 3, name: "Transaction Service", category: "Transactions", description: "Processes deposits, withdrawals, and transfers." },
  { id: 4, name: "Payment Gateway Service", category: "Payments", description: "Integrates with external payment providers for transactions." },
  { id: 5, name: "Fraud Detection Service", category: "Security", description: "Monitors transactions for fraudulent activity." },
  { id: 6, name: "Notification Service", category: "Communication", description: "Sends alerts and notifications to users." },
];

const categories = ["Choose Searching Method", "Traditional Searching", "Advanced Semantic Searching"];

const ServiceDiscovery = () => {
  const [categoryInput, setCategoryInput] = useState("All");
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [chatVisible, setChatVisible] = useState(false); // State to toggle chatbot visibility

  const handleSearch = () => {
    const searchQuery = "banking system";
    const results = services.filter((service) => {
      return (
        ((!nameInput || service.name.toLowerCase().includes(nameInput.toLowerCase())) ||
          service.name.toLowerCase().includes(searchQuery)) &&

        (categoryInput === "All" || service.category === categoryInput) &&
        
        ((!descriptionInput || service.description.toLowerCase().includes(descriptionInput.toLowerCase())) ||
          service.description.toLowerCase().includes(searchQuery))
      );
    });
    setFilteredServices(results);
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev); // Toggle chatbot visibility
  };

  return (
    <div className="service-discovery-container">
      <h2>SERVIO Smart Service Discovery</h2>
      
      <div className="search-bar-container">
      <select
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          className="search-input"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Aspect 1"
          className="search-input"
        />
        
        

        <input
          type="text"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
          placeholder="Aspect 2"
          className="search-input"
        />
        
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      
      <div className="smart-assistant-container">
        <p>Need more accurate results?</p>
        <button className="spark-button" onClick={toggleChat}>
          Start Guided Service Discovery
        </button>
      </div>

      <div className="service-results">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service.id} className="service-item">
              <h3>{service.name}</h3>
              <p>{service.description}</p>
            </div>
          ))
        ) : (
          <p>No services found. Please adjust your search criteria.</p>
        )}
      </div>

      {/* Render the ChatBot component and pass setChatVisible as a prop */}
      {chatVisible && <ChatBot setChatVisible={setChatVisible} />}
    </div>
  );
};

export default ServiceDiscovery;
