import React, { useState } from "react";
import "../styles/Home.css"; // Use the same styles as ServiceDiscovery
import ChatBot from "../components/ChatBot.js"; // Ensure ChatBot is imported

const Home = () => {
  const [query, setQuery] = useState("");
  const [aspects, setAspects] = useState("");
  const [programmingLanguage, setProgrammingLanguage] = useState("");
  const [topN, setTopN] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [chatVisible, setChatVisible] = useState(false); // State to toggle chatbot visibility

  const handleSearch = async () => {
    // Validate mandatory fields
    if (!programmingLanguage || !topN) {
      alert("Please select a Programming Language and Top N.");
      return;
    }

    try {
      let requestBody = {};

      if (query && !aspects) {
        // Semantic search (query only)
        requestBody = {
          search_type: "semantic",
          semantic_request: {
            query: query,
            aspects: ["docstring"], // Predefined aspects
            top_n: parseInt(topN), // Convert to integer
          },
        };
      } else if (aspects && !query) {
        // Syntactic search (aspects only)
        requestBody = {
          search_type: "syntactic",
          syntactic_request: {
            query: aspects,
            field: "func_name", // Predefined field
            top_n: parseInt(topN), // Convert to integer
          },
        };
      } else {
        alert("Please enter either a query for semantic search or aspects for syntactic search.");
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
      setFilteredServices(data.results); // Set the results from the API
    } catch (error) {
      console.error("Error during search:", error);
    }
  };

  const handleGuidedSearch = () => {
    // Open the chatbot for guided search
    setChatVisible(true);
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev); // Toggle chatbot visibility
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
            placeholder="Query (e.g., Translate English to Arabic)"
            className="search-input"
          />
          <input
            type="text"
            value={aspects}
            onChange={(e) => setAspects(e.target.value)}
            placeholder="Aspects (e.g., salt_key)"
            className="search-input"
          />
        </div>

        {/* Second Line: Programming Language and Top N */}
        <div className="input-row">
          <label>
            <select
              value={programmingLanguage}
              onChange={(e) => setProgrammingLanguage(e.target.value)}
              required
            >
              <option value="">Select Programming Language</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </label>

          <label>
            <select
              value={topN}
              onChange={(e) => setTopN(e.target.value)}
              required
            >
              <option value="">Select Top N</option>
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
          filteredServices.map((service, index) => (
            <div key={index} className="service-item">
              <h3>{service.function_name || "Unknown"}</h3>
              <p><strong>Description:</strong> {service.docstring}</p>
              <button
                className="view-button"
                onClick={() => window.open(service.url, "_blank")}
              >
                View
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