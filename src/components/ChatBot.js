// src/components/ChatBot.js
import React, { useState } from "react";
import "../styles/ChatBot.css";
import botIcon from "../assets/bot-icon.png";
import userIcon from "../assets/user-icon.png";

const ChatBot = ({ setChatVisible }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! This is Servio, your smart assistant for efficient service discovery." },
    { sender: "bot", text: "What are the details of the service you are looking for?" }
  ]);
  const [input, setInput] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [currentStage, setCurrentStage] = useState(1);
  const [serviceFound, setServiceFound] = useState(false);
  const [refinement, setRefinement] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [features, setFeatures] = useState("");

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput(""); // Reset input

    if (currentStage === 1) {
      setServiceType(input); // Save service type
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Got it! You're looking for: "${newMessage.text}".` },
        { sender: "bot", text: "What features do you need in the service?" }
      ]);
      setCurrentStage(2);
    } else if (currentStage === 2) {
      setFeatures(input); // Save features
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Thank you! Noted: "${newMessage.text}".` },
        { sender: "bot", text: "Searching for services that match your requirements..." }
      ]);

      // Send request to backend
      try {
        const response = await fetch("http://localhost:8000/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            search_type: "guide",
            guide_request: {
              service_type: serviceType,
              features: input, // Use the latest input for features
              refinement: "", // Refinement will be added later
            },
          }),
        });

        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setServiceFound(true);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "Services found! Here are the results:" },
            { sender: "bot", text: data.results.map((service, index) => `${index + 1}. ${service.function_name}`).join("\n") },
            { sender: "bot", text: "Would you like to refine your search?" }
          ]);
          setShowButtons(true); // Show buttons for refinement
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "No services found that match your requirements." },
            { sender: "bot", text: "Please rate your experience & provide feedback." }
          ]);
          setNoResults(true); // Show feedback form
        }
      } catch (error) {
        console.error("Error during search:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "An error occurred while searching. Please try again." }
        ]);
      }
    } else if (currentStage === 3) {
      setRefinement(input); // Save refinement input
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Refinement added: "${newMessage.text}".` },
        { sender: "bot", text: "Searching again with your refinement..." }
      ]);

      // Send refined request to backend
      try {
        const response = await fetch("http://localhost:8000/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            search_type: "guide",
            guide_request: {
              service_type: serviceType,
              features: features,
              refinement: input, // Use the latest input for refinement
            },
          }),
        });

        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "Refined services found! Here are the results:" },
            { sender: "bot", text: data.results.map((service, index) => `${index + 1}. ${service.function_name}`).join("\n") },
            { sender: "bot", text: "Please rate your experience & provide feedback." }
          ]);
          setNoResults(true); // Show feedback form
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "No refined services found." },
            { sender: "bot", text: "Please rate your experience & provide feedback." }
          ]);
          setNoResults(true); // Show feedback form
        }
      } catch (error) {
        console.error("Error during refined search:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "An error occurred while refining the search. Please try again." }
        ]);
      }
    }
  };

  const handleButtonClick = (response) => {
    if (response === "yes") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please provide the refinement you'd like to add." }
      ]);
      setShowButtons(false); // Hide buttons for direct input
      setCurrentStage(3); // Move to refinement stage
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please rate your experience & provide feedback." }
      ]);
      setShowButtons(false); // Hide buttons
      setNoResults(true); // Show feedback form
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>Servio AI Assistant</h3>
        <button className="close-button" onClick={() => setChatVisible(false)}>×</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${msg.sender === "bot" ? "bot" : "user"}`}
          >
            <img src={msg.sender === "bot" ? botIcon : userIcon} alt="icon" className="chat-icon" />
            <div className={`message ${msg.sender === "bot" ? "bot" : "user"}`}>
              {msg.text}
            </div>
          </div>
        ))}
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
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type here..."
        />
        <button onClick={handleSendMessage} className="send-button">▶️</button>
      </div>
    </div>
  );
};

export default ChatBot;