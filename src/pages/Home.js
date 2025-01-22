import React, { useState } from "react";
import "../styles/Home.css"; // Use the same styles as ServiceDiscovery
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

const Home = () => {
  const [query, setQuery] = useState("");
  const [aspects, setAspects] = useState("");
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [topN, setTopN] = useState("");
  const [serviceType, setServiceType] = useState("banking");
  const [features, setFeatures] = useState("authentication");
  const [refinement, setRefinement] = useState("admin");
  const [filteredServices, setFilteredServices] = useState([]);
  const [chatVisible, setChatVisible] = useState(false); // State to toggle chatbot visibility

  const handleSearch = async () => {
    try {
      let requestBody = {};

      if (query && !aspects) {
        // Semantic search (query only)
        requestBody = {
          search_type: "semantic",
          semantic_request: {
            query: query,
            aspects: ["docstring"], // Default aspect
            top_n: topN || 3, // Use default if topN is empty
          },
        };
      } else if (aspects && !query) {
        // Syntactic search (aspects only)
        requestBody = {
          search_type: "syntactic",
          syntactic_request: {
            query: aspects,
            field: "func_name", // Default field
            top_n: topN || 3, // Use default if topN is empty
          },
        };
      } else if (query && aspects) {
        // Semantic search (query and aspects)
        requestBody = {
          search_type: "semantic",
          semantic_request: {
            query: query,
            aspects: aspects.split(","), // Split aspects into an array
            top_n: topN || 3, // Use default if topN is empty
          },
        };
      } else {
        alert("Please enter a query or aspects to perform a search.");
        return;
      }

      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setFilteredServices(data);
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handleGuidedSearch = async () => {
    try {
      const requestBody = {
        search_type: "guide",
        guide_request: {
          service_type: serviceType,
          features: features,
          refinement: refinement,
        },
      };

      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      setFilteredServices(data);
    } catch (error) {
      console.error("Error during guided search:", error);
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
        {/* First Line: Query and Aspects */}
        <div className="input-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query (e.g., user authentication)"
            className="search-input"
          />
          <input
            type="text"
            value={aspects}
            onChange={(e) => setAspects(e.target.value)}
            placeholder="Aspects (e.g., docstring)"
            className="search-input"
          />
        </div>

        {/* Second Line: Programming Language and Top N */}
        <div className="input-row">
          <label>
            <select
              value={programmingLanguage}
              onChange={(e) => setProgrammingLanguage(e.target.value)}
            >
              <option value="">Programming Language</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </label>

          <label>
            <select
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
            >
              <option value="">Top Results</option>
              {[...Array(10).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Third Line: Centered Search Button */}
        <div className="input-row center">
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className="smart-assistant-container">
        <p>Need more accurate results?</p>
        <button className="spark-button" onClick={handleGuidedSearch}>
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

export default Home;