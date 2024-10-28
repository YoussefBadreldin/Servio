// src/pages/ServiceDiscovery.js
import React, { useState } from "react";
import "../styles/ServiceDiscovery.css"; // Adjust the path if needed
import ChatBot from "../components/ChatBot.js"; // Import the ChatBot component

const ServiceDiscovery = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatVisible, setChatVisible] = useState(false);

  const handleSendMessage = () => {
    if (userInput.trim()) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: userInput },
        { sender: "bot", text: "This is a bot response." },
      ]);
      setUserInput("");
    }
  };

  const toggleChat = () => {
    setChatVisible((prev) => !prev);
  };

  return (
    <div className="service-discovery-container">
      <h2>Service Discovery</h2>
      <div className="search-bar-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Search for services..."
          className="search-input"
        />
        <button className="spark-button" onClick={toggleChat}>
          Smart Search
        </button>
      </div>
      {chatVisible && <ChatBot messages={messages} handleSendMessage={handleSendMessage} />}
    </div>
  );
};

export default ServiceDiscovery;
