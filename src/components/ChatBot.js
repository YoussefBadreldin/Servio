import React, { useState } from "react";
import "../styles/ChatBot.css";
import botIcon from "../assets/bot-icon.png";
import userIcon from "../assets/user-icon.png";

const ChatBot = ({ setChatVisible, setFilteredServices }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for?" }
  ]);
  const [input, setInput] = useState("");
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
    if (input.trim() === "") return;

    const newMessage = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    setTimeout(async () => {
      if (currentStage === 1) {
        setServiceType(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "What features do you need in the service?" }
        ]);
        setCurrentStage(2);
      } else if (currentStage === 2) {
        setFeatures(input);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Searching for services that match your requirements..." }
        ]);

        const requestBody = {
          search_type: "guide",
          guide_request: {
            service_type: serviceType,
            features: input,
            refinement: "",
          },
        };

        console.log("Sending request payload:", JSON.stringify(requestBody, null, 2)); // Debugging

        try {
          const response = await fetch("http://localhost:8000/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Received response:", JSON.stringify(data, null, 2)); // Debugging

          setFilteredServices(data.results); // Update results in Home component

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
        } catch (error) {
          console.error("Error during guided search:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "An error occurred during the search. Please try again." }
          ]);
        }
      } else if (currentStage === 3) {
        setRefinements((prevRefinements) => [...prevRefinements, input]);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Searching again with your refinement..." }
        ]);

        const requestBody = {
          search_type: "guide",
          guide_request: {
            service_type: serviceType,
            features: features,
            refinement: refinements.join(", "), // Join multiple refinements
          },
        };

        console.log("Sending refined request payload:", JSON.stringify(requestBody, null, 2)); // Debugging

        try {
          const response = await fetch("http://localhost:8000/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Received refined response:", JSON.stringify(data, null, 2)); // Debugging

          setFilteredServices(data.results); // Update results in Home component

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
        } catch (error) {
          console.error("Error during refined search:", error);
          setMessages((prevMessages) => [
            ...prevMessages,
            { sender: "bot", text: "An error occurred during the refined search. Please try again." }
          ]);
        }
      }
    }, 500);
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