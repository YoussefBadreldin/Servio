// src/pages/Home.js
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
  const [activeModule, setActiveModule] = useState(null); // 'direct', 'guided', or null (initial state)
  const [showWelcome, setShowWelcome] = useState(true); // Controls visibility of the welcome screen
  const [showModuleChoice, setShowModuleChoice] = useState(false); // Controls visibility of module choice

  // Guided Module States
  const [showButtons, setShowButtons] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [currentStage, setCurrentStage] = useState(1);
  const [serviceType, setServiceType] = useState("");
  const [features, setFeatures] = useState("");
  const [refinements, setRefinements] = useState([]);
  const [isRefining, setIsRefining] = useState(false);

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
        // Direct Module Logic (unchanged)
        const formData = new FormData();
        if (file) {
          formData.append("file", file);
        }
        if (inputValue.trim()) {
          formData.append("query", inputValue);
        }

        const response = await fetch("http://localhost:8000/direct-search", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFilteredServices(data.results);

        const botMessage = { text: "Here are the results I found:", sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botMessage]);

        // Ask if the user needs enhancements using the Guided Module
        const enhancementMessage = { text: "Do you need further enhancements using the Guided Module?", sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, enhancementMessage]);
      } else if (activeModule === "guided") {
        // Guided Module Logic
        if (currentStage === 1) {
          setServiceType(inputValue);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "What features do you need in the service?" }
          ]);
          setCurrentStage(2);
        } else if (currentStage === 2) {
          setFeatures(inputValue);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "Searching for services that match your requirements..." }
          ]);

          const requestBody = {
            search_type: "guide",
            guide_request: {
              service_type: serviceType,
              features: inputValue,
              refinement: "",
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

          if (data.results.length > 0) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "bot", text: "Service found! Would you like to refine your search?" }
            ]);
            setShowButtons(true);
            setIsRefining(true);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "bot", text: "No service found that match your requirements." },
              { sender: "bot", text: "Please rate your experience & provide feedback." }
            ]);
            setNoResults(true);
          }
        } else if (currentStage === 3) {
          setRefinements((prevRefinements) => [...prevRefinements, inputValue]);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "Searching again with your refinement..." }
          ]);

          const requestBody = {
            search_type: "guide",
            guide_request: {
              service_type: serviceType,
              features: features,
              refinement: refinements.join(", "),
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

          if (data.results.length > 0) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "bot", text: "Refined service found! Here is the result." },
              { sender: "bot", text: "Would you like to refine further?" }
            ]);
            setShowButtons(true);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "bot", text: "No refined service found." },
              { sender: "bot", text: "Would you like to try refining further or rate your experience?" }
            ]);
            setShowButtons(true);
          }
        }
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
    setMessages([{ text: module === "direct" ? "Please enter your aspects or upload an aspects file." : "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for?", sender: "bot" }]);
  };

  const handleBack = () => {
    if (activeModule) {
      setActiveModule(null);
      setShowModuleChoice(true);
    } else if (showModuleChoice) {
      setShowModuleChoice(false);
      setShowWelcome(true);
    }
  };

  const handleButtonClick = (response) => {
    if (response === "yes") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please provide the next refinement you'd like to add." }
      ]);
      setShowButtons(false);
      setCurrentStage(3); // Allow further refinements
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please rate your experience & provide feedback." }
      ]);
      setShowButtons(false);
      setNoResults(true);
      setIsRefining(false); // End refinement process
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
            <p>Use written aspects or upload files to conduct precise searches.</p>
            <h3>Guided Service Discovery</h3>
            <p>Interact with a chatbot to refine your queries and get contextually relevant results using RAG techniques.</p>
            <p>Note: It can also be used to enhance results obtained from the Direct Service Discovery module.</p>
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
                    ? "Enter aspects or upload a file..."
                    : "Describe your requirements..."
                }
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <label htmlFor="file-upload" className="file-upload-label">
                📎 Upload
                <input
                  id="file-upload"
                  type="file"
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
              <p>No services found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;