// src/pages/ServiceDiscovery.js
import React, { useState } from "react";
import "../styles/ServiceDiscovery.css";
import ChatBot from "../components/ChatBot.js"; // Ensure ChatBot is imported

const services = [
  {
    id: 1,
    name: "Patient Record Management",
    scope: "Healthcare",
    programmingLanguage: "Python",
    codeType: "API",
    purpose: "Manage Patient Records",
    complexityLevel: "Intermediate",
    description: "A service for storing and retrieving patient medical records securely.",
    documentationLink: "https://example.com/patient-record-management-docs",
  },
  {
    id: 2,
    name: "Learning Recommendation System",
    scope: "Education",
    programmingLanguage: "Python",
    codeType: "Algorithm",
    purpose: "Recommendation Engine",
    complexityLevel: "Advanced",
    description: "Provides personalized learning content recommendations based on user data.",
    documentationLink: "https://example.com/learning-recommendation-system-docs",
  },
  {
    id: 3,
    name: "Fraud Detection Service",
    scope: "Finance",
    programmingLanguage: "Java",
    codeType: "Algorithm",
    purpose: "Fraud Detection",
    complexityLevel: "Advanced",
    description: "Analyzes transaction patterns to detect fraudulent activities.",
    documentationLink: "https://example.com/fraud-detection-docs",
  },
  {
    id: 4,
    name: "Inventory Management",
    scope: "Retail",
    programmingLanguage: "JavaScript",
    codeType: "API",
    purpose: "Inventory Tracking",
    complexityLevel: "Intermediate",
    description: "Helps retailers manage stock levels and track inventory efficiently.",
    documentationLink: "https://example.com/inventory-management-docs",
  },
];

const ServiceDiscovery = () => {
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [codeType, setCodeType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [complexityLevel, setComplexityLevel] = useState("");
  const [scope, setScope] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [chatVisible, setChatVisible] = useState(false); // State to toggle chatbot visibility

  const handleSearch = () => {
    if (
      !scope &&
      !programmingLanguage &&
      !codeType &&
      !purpose &&
      !complexityLevel
    ) {
      // If no input is provided, show all services
      setFilteredServices(services);
    } else {
      // Filter services based on provided inputs
      const results = services.filter((service) => {
        return (
          (!scope || service.scope.toLowerCase().includes(scope.toLowerCase())) &&
          (!programmingLanguage || service.programmingLanguage.toLowerCase().includes(programmingLanguage.toLowerCase())) &&
          (!codeType || service.codeType.toLowerCase().includes(codeType.toLowerCase())) &&
          (!purpose || service.purpose.toLowerCase().includes(purpose.toLowerCase())) &&
          (!complexityLevel || service.complexityLevel.toLowerCase().includes(complexityLevel.toLowerCase()))
        );
      });
      setFilteredServices(results);
    }
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev); // Toggle chatbot visibility
  };

  const handleDownload = (service) => {
    const serviceData = JSON.stringify(service, null, 2);
    const blob = new Blob([serviceData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${service.name.replace(/ /g, "_")}.json`;
    link.click();
  };

  return (
    <div className="service-discovery-container">
      <h2>SERVIO Smart Service Discovery</h2>

      <div className="search-bar-container">
        <input
          type="text"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder="Scope (e.g., Healthcare, Finance)"
          className="search-input"
        />

        <input
          type="text"
          value={programmingLanguage}
          onChange={(e) => setProgrammingLanguage(e.target.value)}
          placeholder="Programming Language"
          className="search-input"
        />

        <input
          type="text"
          value={codeType}
          onChange={(e) => setCodeType(e.target.value)}
          placeholder="Code Type"
          className="search-input"
        />

        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose"
          className="search-input"
        />

        <input
          type="text"
          value={complexityLevel}
          onChange={(e) => setComplexityLevel(e.target.value)}
          placeholder="Complexity Level"
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
              <p><strong>Scope:</strong> {service.scope}</p>
              <p><strong>Programming Language:</strong> {service.programmingLanguage}</p>
              <p><strong>Code Type:</strong> {service.codeType}</p>
              <p><strong>Purpose:</strong> {service.purpose}</p>
              <p><strong>Complexity Level:</strong> {service.complexityLevel}</p>
              <p><strong>Description:</strong> {service.description}</p>
              <button
                className="view-button"
                onClick={() => window.open(service.documentationLink, "_blank")}
              >
                View Documentation
              </button>
              <button
                className="download-button"
                onClick={() => handleDownload(service)}
              >
                Download 
              </button>
            </div>
          ))
        ) : (
          <p>No services found. Please adjust your search criteria.</p>
        )}
      </div>

      {chatVisible && <ChatBot setChatVisible={setChatVisible} />}
    </div>
  );
};

export default ServiceDiscovery;
