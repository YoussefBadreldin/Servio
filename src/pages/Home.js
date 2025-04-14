import React, { useState } from "react";
import "../styles/Home.css";

const Home = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showModuleChoice, setShowModuleChoice] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [currentStage, setCurrentStage] = useState(1);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const toggleDescription = (index) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !file) return;
  
    const userMessage = { text: inputValue, sender: "user", file: file ? file.name : null };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setFile(null);
  
    setIsLoading(true);
    setErrorMessage("");
  
    try {
      if (activeModule === "direct") {
        // Direct Discovery Module with predefined XML path
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Searching for services matching: "${inputValue}"` }
        ]);
  
        // Predefined XML path - adjust this to your actual path
        const xmlPath = "data/xml_aspects/9c2358ac-1c2a-42b8-a464-386fdf0f8416.xml";
        
        const response = await fetch("http://localhost:8000/api/direct/discover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: inputValue.trim(),
            xml_path: xmlPath
          })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        
        // Format results for display
        const formattedResults = data.matches.map(service => ({
          function_name: service.func_name,
          docstring: service.docstring,
          url: service.url,
          confidence: service.similarity_score
        }));
  
        setFilteredServices(formattedResults);
  
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            sender: "bot", 
            text: `Found ${formattedResults.length} matching services sorted by similarity score:`
          }
        ]);

      } else if (activeModule === "guided") {
        // Guided Discovery Module
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `User query: "${inputValue}"` },
          { sender: "bot", text: "Starting discovery process..." }
        ]);

        const response = await fetch("http://localhost:8000/api/guided/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: inputValue })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        const formattedResults = data.recommendations.map(service => ({
          function_name: service.service_name,
          docstring: service.description,
          url: service.url,
          confidence: service.confidence
        }));

        setFilteredServices(formattedResults);

        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            sender: "bot", 
            text: `Based on your query, here are the top ${formattedResults.length} service recommendations from the registry:`
          }
        ]);

        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Would you like to refine your search?" }
        ]);
        setShowButtons(true);
      }
    } catch (error) {
      console.error("Error during search:", error);
      setErrorMessage("An error occurred during the search. Please try again.");
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setErrorMessage("");
  };

  const handleStartNow = () => {
    setShowWelcome(false);
    setShowModuleChoice(true);
  };

  const handleModuleSelect = (module) => {
    setActiveModule(module);
    setShowModuleChoice(false);
    setMessages([{ 
      text: module === "direct" 
        ? "Please enter your query or upload an XML file to search for services." 
        : "Hello! This is Servio AI Assistant. What type of service are you looking for?", 
      sender: "bot" 
    }]);
  };

  const handleBack = () => {
    if (activeModule) {
      setActiveModule(null);
      setShowModuleChoice(true);
      setMessages([]);
      setFilteredServices([]);
      setExpandedDescriptions({});
    } else if (showModuleChoice) {
      setShowModuleChoice(false);
      setShowWelcome(true);
    }
  };

  const handleButtonClick = (response) => {
    if (response === "yes") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please provide additional details to refine your search." }
      ]);
      setShowButtons(false);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please rate your experience & provide feedback." }
      ]);
      setShowButtons(false);
      setNoResults(true);
    }
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleRatingSubmit = () => {
    if (selectedRating > 0 && feedback.trim() !== "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: `Rating: ${selectedRating} stars, Feedback: ${feedback}` },
        { sender: "bot", text: "Thank you for your feedback!" }
      ]);
      setNoResults(false);
      setSelectedRating(0);
      setFeedback("");
    } else {
      alert("Please provide both a rating and feedback before submitting.");
    }
  };

  return (
    <div className="chat-container">
      {showWelcome ? (
        <div className="welcome-screen">
          <h1>Welcome to SERVIO</h1>
          <h2>A RAG-Enabled Smart Service Discovery Tool</h2>
          <p className="intro">
            SERVIO is a Retrieval-Augmented Generation (RAG)-enabled tool designed to enhance service discovery through two complementary modules:
          </p>
          <div className="module-intro">
            <h3>Direct Service Discovery</h3>
            <p>Use written queries or upload XML files to conduct precise searches.</p>
            <h3>Guided Service Discovery</h3>
            <p>Interact with a chatbot to refine your queries and get contextually relevant results.</p>
          </div>
          <button className="start-now-button" onClick={handleStartNow}>
            Start Now
          </button>
        </div>
      ) : showModuleChoice ? (
        <div className="module-choice-screen">
          <h2>Choose type of Service Discovery</h2>
          <div className="module-buttons">
            <button className="module-button" onClick={() => handleModuleSelect("direct")}>
              Direct Service Discovery
            </button>
            <button className="module-button" onClick={() => handleModuleSelect("guided")}>
              Guided Service Discovery
            </button>
          </div>
          <button className="back-button" onClick={handleBack}>
            Back
          </button>
        </div>
      ) : (
        <>
          <h2>
            {activeModule === "direct"
              ? "SERVIO DIRECT SERVICE DISCOVERY"
              : "SERVIO GUIDED SERVICE DISCOVERY"}
          </h2>

          {showPopup && (
            <div className="error-popup">
              <div className="error-popup-content">
                <p>{errorMessage}</p>
                <button onClick={closePopup}>Close</button>
              </div>
            </div>
          )}

          <div className="chat-window">
            <button className="back-button" onClick={handleBack}>
              Back
            </button>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.sender}`}>
                  <p>{message.text}</p>
                  {message.file && (
                    <div className="file-attachment">
                      <span>📎 {message.file}</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && <div className="message bot">Searching...</div>}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  activeModule === "direct"
                    ? "Enter your query or upload XML file..."
                    : "Describe the service you're looking for..."
                }
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <label htmlFor="file-upload" className="file-upload-label">
                📎 Upload
                <input
                  id="file-upload"
                  type="file"
                  accept={activeModule === "direct" ? ".xml" : "*"}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
              <button onClick={handleSendMessage} disabled={isLoading}>
                Send
              </button>
            </div>

            {showButtons && (
              <div className="response-buttons">
                <button onClick={() => handleButtonClick("yes")} className="response-button">Yes</button>
                <button onClick={() => handleButtonClick("no")} className="response-button">No</button>
              </div>
            )}

            {noResults && (
              <div className="feedback-form">
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= selectedRating ? "selected" : ""}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Your feedback..."
                />
                <button onClick={handleRatingSubmit} className="submit-feedback-button">Submit Feedback</button>
              </div>
            )}
          </div>

          <div className="service-results">
            {filteredServices.length > 0 ? (
              <div className="services-container">
                <h3>Service Results</h3>
                {filteredServices
                  .sort((a, b) => b.confidence - a.confidence)
                  .map((service, index) => (
                    <div key={index} className="service-card">
                      <div className="service-header">
                        <h4 className="service-name">{service.function_name}</h4>
                        <span className="confidence-badge">
                          Score: {service.confidence.toFixed(1)}
                        </span>
                      </div>
                      <div className="service-description">
                        <p>
                          {expandedDescriptions[index] 
                            ? service.docstring
                            : service.docstring.split('\n')[0]}
                          {service.docstring.split('\n').length > 1 && (
                            <span 
                              className="see-more" 
                              onClick={() => toggleDescription(index)}
                            >
                              {expandedDescriptions[index] ? ' [see less]' : '... [see more]'}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="service-actions">
                        <button
                          className="view-button"
                          onClick={() => window.open(service.url, "_blank")}
                        >
                          View Source
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              !isLoading && <p>No services found. Try adjusting your search criteria.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;