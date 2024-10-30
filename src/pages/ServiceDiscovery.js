// src/pages/ServiceDiscovery.js
import React, { useState } from "react";
import "../styles/ServiceDiscovery.css";
import ChatBot from "../components/ChatBot.js";

const services = [
  { id: 1, name: "API Integration", category: "Software", description: "Helps integrate APIs." },
  { id: 2, name: "Web Hosting", category: "Infrastructure", description: "Provides web hosting services." },
  { id: 3, name: "Data Analysis", category: "Analytics", description: "Offers data analysis services." },
];

const ServiceDiscovery = () => {
  const [nameInput, setNameInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);

  const handleSearch = () => {
    const results = services.filter((service) => {
      return (
        (!nameInput || service.name.toLowerCase().includes(nameInput.toLowerCase())) &&
        (!categoryInput || service.category.toLowerCase().includes(categoryInput.toLowerCase())) &&
        (!descriptionInput || service.description.toLowerCase().includes(descriptionInput.toLowerCase()))
      );
    });
    setFilteredServices(results);
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  };

  return (
    <div className="service-discovery-container">
      <h2>Service Discovery</h2>
      
      <div className="search-bar-container">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Service Name"
          className="search-input"
        />
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="Category"
          className="search-input"
        />
        <input
          type="text"
          value={descriptionInput}
          onChange={(e) => setDescriptionInput(e.target.value)}
          placeholder="Description or Keywords"
          className="search-input"
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      
      <div className="smart-assistant-container">
        <p>Need more accurate results?</p>
        <button className="spark-button" onClick={toggleChat}>
          Use Servio AI
        </button>
      </div>

      <div className="service-results">
        {filteredServices.map((service) => (
          <div key={service.id} className="service-item">
            <h3>{service.name}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>

      {/* Chatbot modal popup */}
      {chatVisible && (
        <div className="chatbot-modal">
          <div className="chatbot-modal-content">
            <button className="close-button" onClick={toggleChat}>×</button>
            <ChatBot messages={messages} handleSendMessage={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDiscovery;
