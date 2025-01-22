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

  // Check if search is disabled (missing required fields)
  const isSearchDisabled =
    !searchParams.programmingLanguage ||
    !searchParams.topN ||
    (!searchParams.query && !searchParams.aspects);

  // Handle search button click
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
            aspects: ["docstring"], // Predefined
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

      // Log the request body for debugging
      console.log("Request Body:", JSON.stringify(requestBody, null, 2));

      // Send POST request to the server
      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Log the response status for debugging
      console.log("Response Status:", response.status);

      // Handle non-OK responses
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the response data
      const data = await response.json();
      console.log("Response Data:", data);

      // Update the filtered services state
      setFilteredServices(data.results);
    } catch (error) {
      console.error("Error during search:", error);
      alert("An error occurred during the search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle chatbot visibility
  const handleGuidedSearch = () => setChatVisible(true);
  const toggleChat = () => setChatVisible((prev) => !prev);

  return (
    <div className="service-discovery-container">
      <h2>SERVIO Smart Service Discovery</h2>

      {/* Search Bar */}
      <div className="search-bar-container">
        {/* First Line: Query and Aspects */}
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

        {/* Second Line: Programming Language and Top N */}
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

        {/* Third Line: Search Button */}
        <div className="input-row center">
          <button className="search-button" onClick={handleSearch} disabled={isSearchDisabled || isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Smart Assistant Section */}
      <div className="smart-assistant-container">
        <p>Need more accurate results?</p>
        <button className="spark-button" onClick={handleGuidedSearch}>
          Start Guided Service Discovery
        </button>
      </div>

      {/* Results Section */}
      <div className="service-results">
        {filteredServices.length > 0 ? (
          filteredServices.map((service, index) => (
            <div key={index} className="service-item">
              {/* Function Name */}
              <h3>{service.function_name || "Unknown"}</h3>

              {/* Docstring */}
              <p><strong>Description:</strong> {service.docstring}</p>

              {/* View Button */}
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

      {/* ChatBot */}
      {chatVisible && <ChatBot setChatVisible={setChatVisible} />}
    </div>
  );
};

export default Home;