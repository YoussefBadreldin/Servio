import React, { useState } from "react";
import "../styles/ChatBot.css";
import botIcon from "../assets/bot-icon.png";
import userIcon from "../assets/user-icon.png";

const ChatBot = ({ setChatVisible }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! This is Servio, your smart assistant for efficient service discovery." },
    { sender: "bot", text: "What system are you planning to build?" }
  ]);
  const [input, setInput] = useState("");
  const [showButtons, setShowButtons] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [currentStage, setCurrentStage] = useState(1);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput(""); // Reset input

    setTimeout(() => {
      if (currentStage === 1) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Got it! You're looking to build: "${newMessage.text}".` },
          { sender: "bot", text: "What specific feature should this service have?" }
        ]);
        setCurrentStage(2);
      } else if (currentStage === 2) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: `Thank you! Noted: "${newMessage.text}".` },
          { sender: "bot", text: "Do you need to add any other info?" }
        ]);
        setShowButtons(true); // Show buttons for the "any other info" question
      }
    }, 500);
  };

  const handleButtonClick = (response) => {
    if (response === "yes") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Please provide the additional info you'd like to add." }
      ]);
      setShowButtons(false); // Hide buttons for direct input
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Searching for appropriate services..." }
      ]);
      setTimeout(() => {
        setNoResults(true);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Services found that match your requirements!" },
          { sender: "bot", text: "Please rate your experience & provide feedback." }
        ]);
        setShowButtons(false);
      }, 1000);
    }
  };

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleRatingSubmit = () => {
    if (selectedRating && feedback) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: `Rating: ${selectedRating} stars, Feedback: ${feedback}` },
        { sender: "bot", text: "Thank you for your feedback!" }
      ]);
      setNoResults(false);
      setSelectedRating(0);
      setFeedback("");
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
        <h3>Servio AI</h3>
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
