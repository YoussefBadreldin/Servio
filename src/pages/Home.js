// src/pages/Home.js
import React, { useState } from "react";
import "../styles/Home.css";
import ChatBot from "../components/ChatBot.js";

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    query: "",
    aspects: "",
    programmingLanguage: "",
    topN: "",
  });
  const [filteredServices, setFilteredServices] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSearch = async () => {
    setFilteredServices([]);
    setErrorMessage("");
    setShowPopup(false);

    if (searchParams.query && searchParams.aspects) {
      setErrorMessage("Please enter either a query for semantic search or aspects for syntactic search, not both.");
      setShowPopup(true);
      return;
    }

    const missingFields = [];
    if (!searchParams.programmingLanguage) missingFields.push("programming language");
    if (!searchParams.topN) missingFields.push("number of top results");
    if (!searchParams.query && !searchParams.aspects) missingFields.push("query or aspects");

    if (missingFields.length > 0) {
      setErrorMessage(`Please provide: ${missingFields.join(", ")}.`);
      setShowPopup(true);
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = searchParams.query
        ? {
            search_type: "semantic",
            semantic_request: {
              query: searchParams.query,
              aspects: [searchParams.programmingLanguage.toLowerCase()],
              top_n: parseInt(searchParams.topN),
            },
          }
        : {
            search_type: "syntactic",
            syntactic_request: {
              query: searchParams.aspects,
              field: "func_name",
              top_n: parseInt(searchParams.topN),
            },
          };

      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setFilteredServices(data.results);
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("An error occurred during the search. Please try again.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuidedSearch = () => setChatVisible(true);
  const closePopup = () => {
    setShowPopup(false);
    setErrorMessage("");
  };

  return (
    <div className="service-discovery-container">
      <h2>SERVIO Smart Service Discovery</h2>

      {showPopup && (
        <div className="error-popup">
          <div className="error-popup-content">
            <p>{errorMessage}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      <div className="search-bar-container">
        <div className="input-row">
          <input
            type="text"
            value={searchParams.query}
            onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
            placeholder="Query"
            className="search-input"
          />
          <input
            type="text"
            value={searchParams.aspects}
            onChange={(e) => setSearchParams({ ...searchParams, aspects: e.target.value })}
            placeholder="Aspects"
            className="search-input"
          />
        </div>

        <div className="input-row">
          <select
            id="programming-language"
            value={searchParams.programmingLanguage}
            onChange={(e) => setSearchParams({ ...searchParams, programmingLanguage: e.target.value })}
            required
          >
            <option value="">Select Programming Language</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="JavaScript">JavaScript</option>
          </select>

          <select
            id="top-n"
            value={searchParams.topN}
            onChange={(e) => setSearchParams({ ...searchParams, topN: e.target.value })}
            required
          >
            <option value="">Select Number of top results</option>
            {[...Array(10).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="input-row center">
          <button className="search-button" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
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

      {chatVisible && <ChatBot setChatVisible={setChatVisible} setFilteredServices={setFilteredServices} />}
    </div>
  );
};

export default Home;