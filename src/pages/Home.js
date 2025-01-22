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

  const isSearchDisabled =
    !searchParams.programmingLanguage ||
    !searchParams.topN ||
    (!searchParams.query && !searchParams.aspects);

  const handleSearch = async () => {
    if (isSearchDisabled) return;

    setIsLoading(true);
    try {
      let requestBody = {};

      if (searchParams.query) {
        // Semantic search
        requestBody = {
          search_type: "semantic",
          semantic_request: {
            query: searchParams.query,
            aspects: ["python"], // Predefined
            top_n: parseInt(searchParams.topN),
          },
        };
      } else if (searchParams.aspects) {
        // Syntactic search
        requestBody = {
          search_type: "syntactic",
          syntactic_request: {
            query: "salt_key", // Predefined
            field: searchParams.aspects, // User-provided aspects
            top_n: parseInt(searchParams.topN),
          },
        };
      } else {
        alert("Please enter either a query for semantic search or aspects for syntactic search.");
        return;
      }

      const response = await fetch("http://localhost:8000/search", {
        method: "POST", // Ensure POST method
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody), // Send data in the body
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setFilteredServices(data.results);
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred during the search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuidedSearch = () => setChatVisible(true);
  const toggleChat = () => setChatVisible((prev) => !prev);

  return (
    <div className="service-discovery-container">
      <h2>SERVIO Smart Service Discovery</h2>

      <div className="search-bar-container">
        <div className="input-row">
          <input
            type="text"
            value={searchParams.query}
            onChange={(e) => setSearchParams({ ...searchParams, query: e.target.value })}
            placeholder="Query (e.g., Translate English to Arabic)"
            className="search-input"
          />
          <input
            type="text"
            value={searchParams.aspects}
            onChange={(e) => setSearchParams({ ...searchParams, aspects: e.target.value })}
            placeholder="Aspects (e.g., salt_key)"
            className="search-input"
          />
        </div>

        <div className="input-row">
          <label htmlFor="programming-language">Programming Language</label>
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

          <label htmlFor="top-n">Top N</label>
          <select
            id="top-n"
            value={searchParams.topN}
            onChange={(e) => setSearchParams({ ...searchParams, topN: e.target.value })}
            required
          >
            <option value="">Select Top N</option>
            {[...Array(10).keys()].map((i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div className="input-row center">
          <button className="search-button" onClick={handleSearch} disabled={isSearchDisabled || isLoading}>
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

      {chatVisible && <ChatBot setChatVisible={setChatVisible} />}
    </div>
  );
};

export default Home;