import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ModuleChoice.css";

const ModuleChoice = () => {
  const navigate = useNavigate();

  const handleModuleSelect = (module) => {
    navigate("/registry-choice", { state: { module } });
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="choice-screen">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <h2>Select Discovery Mode</h2>
      <div className="option-cards">
        {[
          { module: "direct", title: "Direct Discovery", description: "Precise aspect-based search" },
          { module: "guided", title: "Guided Discovery", description: "AI-powered conversational search" }
        ].map((option, i) => (
          <div 
            key={i} 
            className="option-card" 
            onClick={() => handleModuleSelect(option.module)}
          >
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleChoice; 