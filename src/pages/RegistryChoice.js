import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/RegistryChoice.css";

const RegistryChoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { module } = location.state || {};

  const handleRegistrySelect = (type) => {
    if (type === "custom") {
      navigate("/build-registry", { state: { module } });
    } else {
      navigate("/discovery", { state: { module, registryType: "default" } });
    }
  };

  const handleBack = () => {
    navigate("/module-choice");
  };

  return (
    <div className="choice-screen">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <h2>Select Registry Type</h2>
      <div className="option-cards">
        {[
          { type: "default", title: "Servio Registry", description: "Use pre-built data registry", emoji: "📦" },
          { type: "custom", title: "Custom Registry", description: "Use existing or build new registry", emoji: "🔧" }
        ].map((option, i) => (
          <div 
            key={i} 
            className="option-card" 
            onClick={() => handleRegistrySelect(option.type)}
          >
            <span className="option-emoji">{option.emoji}</span>
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegistryChoice; 