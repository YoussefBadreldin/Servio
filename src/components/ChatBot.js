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

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput(""); // Reset input

    setTimeout(() => {
      if (currentStage === 1) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Got it! You're looking for: "${newMessage.text}".` },
          { sender: "bot", text: "What features do you need in the service?" }
        ]);
        setCurrentStage(2);
      } else if (currentStage === 2) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Thank you! Noted: "${newMessage.text}".` },
          { sender: "bot", text: "Searching for services that match your requirements..." }
        ]);
        setTimeout(() => {
          // Simulate service search
          const foundServices = true; // Change this to false to simulate no results
          if (foundServices) {
            setServiceFound(true);
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "bot", text: "Services found! Here are the results:" },
              { sender: "bot", text: "1. Service A\n2. Service B\n3. Service C" },
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
        }, 1000);
      } else if (currentStage === 3) {
        setRefinement(input); // Save refinement input
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Refinement added: "${newMessage.text}".` },
          { sender: "bot", text: "Searching again with your refinement..." }
        ]);
        setTimeout(() => {
          // Simulate refined search
          const foundRefinedServices = true; // Change this to false to simulate no results
          if (foundRefinedServices) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { sender: "bot", text: "Refined services found! Here are the results:" },
              { sender: "bot", text: "1. Refined Service A\n2. Refined Service B" },
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
        }, 1000);
      }
    }, 500);
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
    // Debugging: Log the selectedRating and feedback values
    console.log("Selected Rating:", selectedRating);
    console.log("Feedback:", feedback);

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