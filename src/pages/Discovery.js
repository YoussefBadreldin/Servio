import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Home.css";

const API_BASE_URL = "http://localhost:8000/api";

const Discovery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { module, registryType, registryPath } = location.state || {};

  const [state, setState] = useState({
    messages: [],
    inputValue: "",
    filteredServices: [],
    isLoading: false,
    errorMessage: "",
    showPopup: false,
    file: null,
    aspects: [],
    currentAspect: { key: "", value: "" },
    suggestedAspects: [],
    showAspectForm: false
  });

  useEffect(() => {
    // Add initial message based on module type
    setState(prev => ({
      ...prev,
      messages: [
        { 
          sender: "bot", 
          text: module === "direct" 
            ? "Please enter your query and either add aspects or upload an XML file"
            : "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for? \n (N.B: you can upload supporting documents as umls or xmls)" 
        }
      ]
    }));

    if (module === "direct") {
      fetchSuggestedAspects();
    }
  }, [module]);

  const fetchSuggestedAspects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/direct/suggest-aspects`);
      const data = await response.json();
      setState(prev => ({ 
        ...prev,
        suggestedAspects: data.suggested_aspects.map(aspect => ({
          key: aspect,
          display: aspect.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        })) 
      }));
    } catch (error) {
      console.error("Error fetching aspects:", error);
      // Fallback to default aspects
      setState(prev => ({
        ...prev,
        suggestedAspects: [
          { key: "name", display: "Service Name" },
          { key: "full_name", display: "Full Name" },
          { key: "description", display: "Description" },
          { key: "url", display: "URL" },
          { key: "stars", display: "Stars" },
          { key: "forks", display: "Forks" },
          { key: "language", display: "Language" },
          { key: "license", display: "License" },
          { key: "readme", display: "Readme" }
        ]
      }));
    }
  };

  const handleBack = () => {
    navigate("/registry-choice");
  };

  const handleSendMessage = async () => {
    if (!state.inputValue.trim() && !state.file) return;
  
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, { 
        text: state.inputValue, 
        sender: "user", 
        file: state.file ? state.file.name : null 
      }],
      inputValue: "",
      file: null,
      isLoading: true,
      errorMessage: ""
    }));

    try {
      if (module === "direct") {
        await handleDirectDiscovery();
      } else {
        await handleGuidedDiscovery();
      }
    } catch (error) {
      console.error("Discovery error:", error);
      setState(prev => ({
        ...prev,
        errorMessage: error.message || "An error occurred. Please try again.",
        showPopup: true
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDirectDiscovery = async () => {
    if (state.aspects.length > 0) {
      const response = await fetch(`${API_BASE_URL}/direct/create-xml`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aspects: state.aspects })
      });
      const data = await response.json();
      await performDiscovery(data.xml_path);
    } else if (state.file) {
      const formData = new FormData();
      formData.append("file", state.file);
      
      const response = await fetch(`${API_BASE_URL}/direct/upload-xml`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      await performDiscovery(data.xml_path);
    } else {
      await performDiscovery(null);
    }
  };

  const handleGuidedDiscovery = async () => {
    const response = await fetch(`${API_BASE_URL}/guided/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: state.inputValue })
    });
    const data = await response.json();
    displayResults(data);
  };

  const performDiscovery = async (xmlPath) => {
    const response = await fetch(`${API_BASE_URL}/direct/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: state.inputValue.trim(),
        xml_path: xmlPath
      })
    });
    const data = await response.json();
    displayResults(data);
  };

  const displayResults = useCallback((data) => {
    const results = data.matches || data.recommendations || [];
    
    const formattedResults = results.map(service => ({
      name: service.name || service.service_name || service.func_name,
      full_name: service.full_name || "",
      description: service.description || service.docstring || "",
      url: service.url || service.html_url || "",
      stars: service.stars || service.stargazers_count || 0,
      forks: service.forks || service.forks_count || 0,
      language: service.language || "",
      license: service.license?.name || "",
      readme: service.readme || "",
      confidence: service.confidence || service.similarity_score || 0,
      function_name: service.function_name || service.name || ""
    }));
  
    setState(prev => ({
      ...prev,
      filteredServices: formattedResults,
      messages: [
        ...prev.messages,
        { 
          sender: "bot", 
          text: formattedResults.length > 0 
            ? `Found ${formattedResults.length} matching services sorted according to their confidence score.`
            : "No matching services found.",
          ...(module === "guided" && data.response_text && { llmResponse: data.response_text })
        }
      ]
    }));
  }, [module]);

  const handleFileChange = (e, fileType = "xml") => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setState(prev => ({
        ...prev,
        file: selectedFile,
        messages: [
          ...prev.messages,
          { sender: "user", text: `Uploaded ${fileType.toUpperCase()} file: ${selectedFile.name}` }
        ]
      }));
    }
  };

  const addAspect = () => {
    if (state.currentAspect.key && state.currentAspect.value) {
      setState(prev => ({
        ...prev,
        aspects: [...prev.aspects, state.currentAspect],
        currentAspect: { key: "", value: "" },
        messages: [
          ...prev.messages,
          { sender: "user", text: `Added aspect: ${state.currentAspect.key}=${state.currentAspect.value}` }
        ]
      }));
    }
  };

  const removeAspect = (index) => {
    setState(prev => ({
      ...prev,
      aspects: prev.aspects.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="discovery-interface">
      <div className="chat-panel">
        <div className="chat-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h2>{module === "direct" ? "Direct Discovery" : "Guided Discovery"}</h2>
          <div className="registry-info">
            <span className="registry-type">
              {registryType === "default" ? "Servio registry" : registryPath ? `Custom: ${registryPath.split('/').pop()}` : "No registry loaded"}
            </span>
          </div>
        </div>
        
        <div className="chat-messages">
          {state.messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
              {msg.file && <div className="file-attachment">📎 {msg.file}</div>}
            </div>
          ))}
          {state.isLoading && <div className="message bot">Processing...</div>}
        </div>

        {module === "direct" && state.showAspectForm && (
          <div className="aspect-form">
            <h3>Add Aspect</h3>
            <div className="aspect-suggestions">
              <p>Suggested aspects:</p>
              <div className="suggestion-tags">
                {state.suggestedAspects.map((aspect, i) => (
                  <span 
                    key={i}
                    className={`aspect-tag ${state.currentAspect.key === aspect.key ? 'active' : ''}`}
                    onClick={() => setState(prev => ({ 
                      ...prev,
                      currentAspect: { 
                        key: aspect.key, 
                        value: prev.currentAspect.key === aspect.key ? prev.currentAspect.value : "" 
                      } 
                    }))}
                  >
                    {aspect.display}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Key:</label>
              <input
                type="text"
                value={state.currentAspect.key}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  currentAspect: {...prev.currentAspect, key: e.target.value}
                }))}
                placeholder="Enter aspect key"
              />
            </div>
            
            <div className="form-group">
              <label>Value:</label>
              <input
                type="text"
                value={state.currentAspect.value}
                onChange={(e) => setState(prev => ({
                  ...prev,
                  currentAspect: {...prev.currentAspect, value: e.target.value}
                }))}
                placeholder="Enter aspect value"
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="primary-button" 
                onClick={addAspect}
                disabled={!state.currentAspect.key || !state.currentAspect.value}
              >
                Add Aspect
              </button>
              
              <button 
                className="secondary-button" 
                onClick={() => setState(prev => ({ 
                  ...prev,
                  showAspectForm: false,
                  currentAspect: { key: "", value: "" }
                }))}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {state.aspects.length > 0 && (
          <div className="aspects-list">
            <h4>Current Aspects</h4>
            {state.aspects.map((aspect, i) => (
              <div key={i} className="aspect-item">
                <span>{aspect.key}: {aspect.value}</span>
                <button onClick={() => removeAspect(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        <div className="input-area">
          <input
            type="text"
            value={state.inputValue}
            onChange={(e) => setState(prev => ({ ...prev, inputValue: e.target.value }))}
            placeholder={module === "direct" ? "Enter your search query..." : "Describe the service you need..."}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />

          {module === "direct" && (
            <button 
              className="aspect-button"
              onClick={() => {
                setState(prev => ({ ...prev, showAspectForm: true }));
                fetchSuggestedAspects();
              }}
            >
              Add Aspect
            </button>
          )}

          {module === "direct" && (
            <label className="file-upload-button">
              Upload XML
              <input 
                type="file" 
                onChange={(e) => handleFileChange(e, "xml")}
                accept=".xml" 
                hidden
              />
            </label>
          )}

          {module === "guided" && (
            <>
              <label className="file-upload-button">
                Upload XML
                <input 
                  type="file" 
                  onChange={(e) => handleFileChange(e, "xml")}
                  accept=".xml" 
                  hidden
                />
              </label>
              <label className="file-upload-button">
                Upload UML
                <input 
                  type="file" 
                  onChange={(e) => handleFileChange(e, "uml")}
                  accept=".uml" 
                  hidden
                />
              </label>
            </>
          )}

          <button 
            className="primary-button"
            onClick={handleSendMessage}
            disabled={state.isLoading}
          >
            Discover
          </button>
        </div>
      </div>

      <div className="results-panel">
        <h3>Service Results</h3>
        {state.filteredServices.length > 0 ? (
          <div className="services-grid">
            {state.filteredServices
              .sort((a, b) => b.confidence - a.confidence)
              .map((service, i) => (
                <div key={i} className="service-card">
                  <div className="service-header">
                    <h4>{service.name}</h4>
                    <span className="confidence-badge">
                      {service.confidence ? `${service.confidence.toFixed(1)}` : "N/A"}
                    </span>
                  </div>
                  <p className="service-description">
                    {service.description?.substring(0, 150)}...
                  </p>
                  {service.url && (
                    <div className="service-footer">
                      <button 
                        className="view-button"
                        onClick={() => window.open(service.url, "_blank")}
                      >
                        View Service
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="no-results">
            {!state.isLoading && <p>No services found yet. Perform a search to see results.</p>}
          </div>
        )}
      </div>

      {state.showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{state.errorMessage}</p>
            <button 
              className="primary-button" 
              onClick={() => setState(prev => ({ ...prev, showPopup: false }))}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discovery; 