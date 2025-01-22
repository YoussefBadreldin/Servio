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
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  const handleSearch = async () => {
    // Clear previous search results and error messages
    setFilteredServices([]);
    setErrorMessage("");
    setShowPopup(false);

    // Check if both query and aspects are provided
    if (searchParams.query && searchParams.aspects) {
      setErrorMessage("Please enter either a query for semantic search or aspects for syntactic search, not both.");
      setShowPopup(true);
      return; // Stop further execution
    }

    // Check which fields are missing
    const missingFields = [];
    if (!searchParams.programmingLanguage) missingFields.push("programming language");
    if (!searchParams.topN) missingFields.push("number of top results");
    if (!searchParams.query && !searchParams.aspects) missingFields.push("query or aspects");

    // If any fields are missing, show a custom error message
    if (missingFields.length > 0) {
      let message = "Please: ";
      if (missingFields.includes("programming language")) {
        message += "select a programming language, ";
      }
      if (missingFields.includes("number of top results")) {
        message += "select the number of top results, ";
      }
      if (missingFields.includes("query or aspects")) {
        message += "enter either a query for semantic search or aspects for syntactic search.";
      }
      setErrorMessage(message);
      setShowPopup(true);
      return; // Stop further execution
    }

    // If all required fields are provided, proceed with the search
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
            query: searchParams.aspects, // Use user-provided aspects as the query
            field: "func_name", // Predefined field
            top_n: parseInt(searchParams.topN),
          },
        };
      }

      // Log the request body for debugging
      console.log("Request Body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Log the response status for debugging
      console.log("Response Status:", response.status);

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
  const toggleChat = () => setChatVisible((prev) => !prev);

  const closePopup = () => {
    setShowPopup(false); // Close the popup
    setErrorMessage(""); // Clear the error message
  };

  return (
    <div className="service-discovery-container">
      <h2>SERVIO Smart Service Discovery</h2>

      {/* Error Popup */}
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

      {chatVisible && <ChatBot setChatVisible={setChatVisible} />}
    </div>
  );
};

export default Home;