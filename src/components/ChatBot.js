import React, { useState } from "react";
import "../styles/ChatBot.css";
import botIcon from "../assets/bot-icon.png"; // Replace with path to your bot icon image
import userIcon from "../assets/user-icon.png"; // Replace with path to your user icon image

const ChatBot = ({ setChatVisible }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! This is Servio, your smart assistant for efficient service discovery." },
    { sender: "bot", text: "How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [showButtons, setShowButtons] = useState(false);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Reset input
    setInput("");

    // Mock bot response
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: `Got it! You're looking for: "${input}".` },
        { sender: "bot", text: "Do you need to add any other info?" } // Follow-up question
      ]);
      setShowButtons(true); // Show buttons after the question
    }, 500);
  };

  const handleButtonClick = (response) => {
    if (response === "yes") {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Great! What additional information would you like to provide?" }
      ]);
    } else {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Searching for appropriate services..." }
      ]);
    }
    setShowButtons(false); // Hide buttons after selection
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
        <button className="close-button" onClick={() => setChatVisible(false)}>×</button> {/* Close button */}
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
