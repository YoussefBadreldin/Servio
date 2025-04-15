// src/pages/Home.js
import React, { useState, useCallback, useEffect } from "react";
import "../styles/Home.css";

// Constants for API endpoints and configuration
const API_BASE_URL = "http://localhost:8000/api";
const DEFAULT_REGISTRY_LIMIT = 5;

const Home = () => {
  // State management
  const [state, setState] = useState({
    messages: [],
    inputValue: "",
    filteredServices: [],
    isLoading: false,
    errorMessage: "",
    showPopup: false,
    file: null,
    activeModule: null,
    showWelcome: true,
    showModuleChoice: false,
    showRegistryChoice: false,
    registryType: null,
    aspects: [],
    currentAspect: { key: "", value: "" },
    suggestedAspects: [],
    showAspectForm: false,
    registryBuilt: false,
    currentRegistryPath: null,
    availableRegistries: [],
    showRegistryList: false,

  });

  // Destructure state for easier access
  const {
    messages, inputValue, filteredServices, isLoading, errorMessage, showPopup,
    file, activeModule, showWelcome, showModuleChoice, showRegistryChoice,
    registryType, aspects, currentAspect, suggestedAspects, showAspectForm,
    registryBuilt, currentRegistryPath, availableRegistries, showRegistryList,
    previousScreen
  } = state;

  // Fetch available registries on component mount
  useEffect(() => {
    const fetchRegistries = async () => {
      try {
        const data = await apiCall("/registry_builder/list_registries");
        updateState({ availableRegistries: data.registries || [] });
      } catch (error) {
        console.error("Error fetching registries:", error);
      }
    };
    
    fetchRegistries();
  }, []);

  // Helper function to update state
  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // API call wrapper for error handling
  const apiCall = async (endpoint, method = "GET", body = null, headers = {}) => {
    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      };

      if (body) {
        options.body = method === "GET" ? null : JSON.stringify(body);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API call error:", error);
      throw error;
    }
  };

  // Handle sending messages and processing discovery
  const handleSendMessage = async () => {
    if (!inputValue.trim() && !file) return;
  
    // Add user message to chat
    updateState({
      messages: [...messages, { 
        text: inputValue, 
        sender: "user", 
        file: file ? file.name : null 
      }],
      inputValue: "",
      file: null,
      isLoading: true,
      errorMessage: ""
    });

    try {
      if (activeModule === "direct") {
        await handleDirectDiscovery();
      } else if (activeModule === "guided") {
        await handleGuidedDiscovery();
      }
    } catch (error) {
      console.error("Discovery error:", error);
      updateState({
        errorMessage: error.message || "An error occurred. Please try again.",
        showPopup: true
      });
    } finally {
      updateState({ isLoading: false });
    }
  };

  // Handle direct discovery logic
  const handleDirectDiscovery = async () => {
    if (aspects.length > 0) {
      // Generate XML from aspects
      const xmlData = await apiCall("/direct/create-xml", "POST", { aspects });
      await performDiscovery(xmlData.xml_path);
    } else if (file) {
      // Handle file upload
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadData = await fetch(`${API_BASE_URL}/direct/upload-xml`, {
        method: "POST",
        body: formData
      }).then(res => res.json());
      
      await performDiscovery(uploadData.xml_path);
    } else {
      // No aspects or file, just perform discovery with query
      await performDiscovery(null);
    }
  };

  // Handle guided discovery logic
  const handleGuidedDiscovery = async () => {
    const data = await apiCall("/guided/recommend", "POST", { query: inputValue });
    displayResults(data);
  };

  // Perform discovery with XML path
  const performDiscovery = async (xmlPath) => {
    const discoveryData = await apiCall("/direct/discover", "POST", {
      query: inputValue.trim(),
      xml_path: xmlPath
    });
    displayResults(discoveryData);
  };

  // Display results in the UI
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
  
    const newMessages = [
      ...messages,
      { 
        sender: "bot", 
        text: formattedResults.length > 0 
          ? `Found ${formattedResults.length} matching services sorted according to their confidence score.`
          : "No matching services found.",
        ...(activeModule === "guided" && data.response_text && { llmResponse: data.response_text })
      }
    ];
  
    updateState({
      filteredServices: formattedResults,
      messages: newMessages
    });
  }, [messages, activeModule]);

  // Handle file uploads
  const handleFileChange = (e, fileType = "xml") => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      updateState({
        file: selectedFile,
        messages: [
          ...messages,
          { sender: "user", text: `Uploaded ${fileType.toUpperCase()} file: ${selectedFile.name}` }
        ]
      });
    }
  };

  // UI flow handlers
  const handleStartNow = () => {
    updateState({
      showWelcome: false,
      showModuleChoice: true,
      previousScreen: "welcome"
    });
  };

  const handleModuleSelect = (module) => {
    updateState({
      activeModule: module,
      showModuleChoice: false,
      showRegistryChoice: true,
      registryBuilt: false,
      registryType: null,
      previousScreen: "moduleChoice"
    });
  };

  const handleRegistrySelect = async (type) => {
    updateState({
      registryType: type,
      showRegistryChoice: false,
      isLoading: true,
      previousScreen: "registryChoice"
    });
    
    try {
      if (type === "default") {
        const result = await apiCall("/direct/set-registry", "POST", { use_default: true });
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        updateState({
          currentRegistryPath: result.registry_path,
          messages: [
            ...messages,
            { sender: "bot", text: "Servio registry loaded successfully" },
            { 
              sender: "bot", 
              text: activeModule === "direct" 
              ? "Please enter your query and either add aspects or upload an XML file"
              : "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for? \n (N.B: you can upload supporting documents as umls or xmls)" 
            }
          ],
          isLoading: false
        });
      } else {
        updateState({
          messages: [
            ...messages,
            { sender: "bot", text: "Please check if you have already built the registry you need before." }
          ],
          isLoading: false,
          showRegistryList: true
        });
      }
    } catch (error) {
      console.error("Registry selection error:", error);
      updateState({
        errorMessage: error.message || "Failed to select registry",
        showPopup: true,
        isLoading: false
      });
    }
  };

  // Load a specific registry
  const loadRegistry = async (registryPath) => {
    updateState({ isLoading: true });
    try {
      const result = await apiCall("/direct/set-registry", "POST", { registry_path: registryPath });
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      updateState({
        currentRegistryPath: registryPath,
        messages: [
          ...messages,
          { sender: "bot", text: `Registry loaded successfully from ${registryPath}` },
          { 
            sender: "bot", 
            text: activeModule === "direct" 
              ? "Please enter your query and either add aspects or upload an XML file"
              : "What service are you looking for?" 
          }
        ],
        isLoading: false,
        registryBuilt: true,
        showRegistryList: false
      });
    } catch (error) {
      console.error("Error loading registry:", error);
      updateState({
        errorMessage: error.message,
        showPopup: true,
        isLoading: false
      });
    }
  };
  
  // Build custom registry
  const buildCustomRegistry = async () => {
    if (!inputValue.trim()) return;
    
    updateState({ isLoading: true });
    try {
      const data = await apiCall("/registry_builder/build", "POST", { 
        query: inputValue, 
        limit: DEFAULT_REGISTRY_LIMIT 
      });
      
      if (data.success) {
        const registryResult = await apiCall("/direct/set-registry", "POST", { 
          registry_path: data.registry_path 
        });
        
        if (!registryResult.success) {
          throw new Error(registryResult.message);
        }
        
        // Refresh registry list
        const registries = await apiCall("/registry_builder/list_registries");
        
        updateState({
          currentRegistryPath: registryResult.registry_path,
          messages: [
            ...messages,
            { sender: "bot", text: `Custom registry built and loaded successfully with ${data.repositories.length} services` },
            { 
              sender: "bot", 
              text: activeModule === "direct" 
              ? "Please enter your query and either add aspects or upload an XML file"
              : "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for? \n (N.B: you can upload supporting documents as umls or xmls)" 
            }
          ],
          inputValue: "",
          isLoading: false,
          registryBuilt: true,
          availableRegistries: registries.registries || [],
          showRegistryList: false
        });
      } else {
        throw new Error(data.message || "Failed to build registry");
      }
    } catch (error) {
      console.error("Error building registry:", error);
      updateState({
        errorMessage: error.message,
        showPopup: true,
        isLoading: false
      });
    }
  };  

  // Fetch suggested aspects
  const fetchSuggestedAspects = async () => {
    try {
      const data = await apiCall("/direct/suggest-aspects");
      updateState({ 
        suggestedAspects: data.suggested_aspects.map(aspect => ({
          key: aspect,
          display: aspect.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        })) 
      });
    } catch (error) {
      console.error("Error fetching aspects:", error);
      // Fallback to default aspects if API fails
      updateState({
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
      });
    }
  };

  // Aspect management
  const addAspect = () => {
    if (currentAspect.key && currentAspect.value) {
      const newAspects = [...aspects, currentAspect];
      updateState({
        aspects: newAspects,
        currentAspect: { key: "", value: "" },
        messages: [
          ...messages,
          { sender: "user", text: `Added aspect: ${currentAspect.key}=${currentAspect.value}` }
        ]
      });
    }
  };

  const removeAspect = (index) => {
    const newAspects = [...aspects];
    newAspects.splice(index, 1);
    updateState({ aspects: newAspects });
  };

  // Navigation functions
  const handleBack = () => {
    if (showModuleChoice) {
      updateState({
        showWelcome: true,
        showModuleChoice: false,
        previousScreen: null
      });
    } else if (showRegistryChoice) {
      updateState({
        showModuleChoice: true,
        showRegistryChoice: false,
        previousScreen: "welcome"
      });
    } else if (showRegistryList) {
      updateState({
        showRegistryList: false,
        showRegistryChoice: true,
        previousScreen: "moduleChoice"
      });
    } else if (registryType === "custom" && !registryBuilt) {
      updateState({
        showRegistryChoice: true,
        registryType: null,
        previousScreen: "moduleChoice"
      }); 
    }
    else if (registryType === "default" ) {
      updateState({
        showRegistryChoice: true,
        registryType: null,
        previousScreen: "moduleChoice"
      }); 
    }
  };

  // Render functions
  const renderWelcomeScreen = () => (
    <div className="welcome-screen">
      <h1>Welcome to SERVIO</h1>
      <h2>RAG-Enabled Smart Service Discovery Tool</h2>
      <div className="features-grid">
        {[

        ].map((feature, i) => (
          <div key={i} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
      <button className="primary-button" onClick={handleStartNow}>
        Get Started
      </button>
    </div>
  );

  const renderModuleChoice = () => (
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

  const renderRegistryChoice = () => (
    <div className="choice-screen">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <h2>Select Registry Type</h2>
      <div className="option-cards">
        {[
          { type: "default", title: "Servio registry", description: "Use pre-built Data" },
          { type: "custom", title: "Custom Registry", description: "Use existing or build new registry" }
        ].map((option, i) => (
          <div 
            key={i} 
            className="option-card" 
            onClick={() => handleRegistrySelect(option.type)}
          >
            <h3>{option.title}</h3>
            <p>{option.description}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRegistryList = () => (
    <div className="registry-list">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <h3>Available Custom Registries</h3>
      <div className="registry-options">
        {availableRegistries.length > 0 ? (
          <>
            {availableRegistries.map((registry, i) => (
              <div 
                key={i} 
                className="registry-option"
                onClick={() => loadRegistry(registry)}
              >
                <div className="registry-name">{registry.split('/').pop()}</div>
                <div className="registry-path">{registry}</div>
              </div>
            ))}
            <div className="registry-actions">
              <button 
                className="primary-button"
                onClick={() => updateState({ 
                  showRegistryList: false,
                  messages: [
                    ...messages,
                    { sender: "bot", text: "Please enter a search query to build a new registry" }
                  ]
                })}
              >
                Build New Registry
              </button>
            </div>
          </>
        ) : (
          <div className="no-registries">
            <p>No existing custom registries found.</p>
            <button 
              className="primary-button"
              onClick={() => updateState({ 
                showRegistryList: false,
                messages: [
                  ...messages,
                  { sender: "bot", text: "Please enter a search query to build a new registry" }
                ]
              })}
            >
              Build New Registry
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderDiscoveryInterface = () => (
    <div className="discovery-interface">
      <div className="chat-panel">
        <div className="chat-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h2>{activeModule === "direct" ? "Direct Discovery" : "Guided Discovery"}</h2>
          <div className="registry-info">
            <span className="registry-type">
              {registryType === "default" ? "Servio registry" : currentRegistryPath ? `Custom: ${currentRegistryPath.split('/').pop()}` : "No registry loaded"}
            </span>
            {registryType === "custom" && (
              <button 
                className="registry-switch-button"
                onClick={() => updateState({ showRegistryList: true })}
              >
                Switch Registry
              </button>
            )}
          </div>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
              {msg.file && <div className="file-attachment">📎 {msg.file}</div>}
            </div>
          ))}
          {isLoading && <div className="message bot">Processing...</div>}
        </div>

        {activeModule === "direct" && showAspectForm && (
          <div className="aspect-form">
            <h3>Add Aspect</h3>
            <div className="aspect-suggestions">
              <p>Suggested aspects:</p>
              <div className="suggestion-tags">
                {suggestedAspects.map((aspect, i) => (
                  <span 
                    key={i}
                    className={`aspect-tag ${currentAspect.key === aspect.key ? 'active' : ''}`}
                    onClick={() => updateState({ 
                      currentAspect: { 
                        key: aspect.key, 
                        value: currentAspect.key === aspect.key ? currentAspect.value : "" 
                      } 
                    })}
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
                value={currentAspect.key}
                onChange={(e) => updateState({
                  currentAspect: {...currentAspect, key: e.target.value}
                })}
                placeholder="Enter aspect key"
              />
            </div>
            
            <div className="form-group">
              <label>Value:</label>
              <input
                type="text"
                value={currentAspect.value}
                onChange={(e) => updateState({
                  currentAspect: {...currentAspect, value: e.target.value}
                })}
                placeholder="Enter aspect value"
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="primary-button" 
                onClick={addAspect}
                disabled={!currentAspect.key || !currentAspect.value}
              >
                Add Aspect
              </button>
              
              <button 
                className="secondary-button" 
                onClick={() => updateState({ 
                  showAspectForm: false,
                  currentAspect: { key: "", value: "" }
                })}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {aspects.length > 0 && (
          <div className="aspects-list">
            <h4>Current Aspects</h4>
            {aspects.map((aspect, i) => (
              <div key={i} className="aspect-item">
                <span>{aspect.key}: {aspect.value}</span>
                <button onClick={() => removeAspect(i)}>×</button>
              </div>
            ))}
          </div>
        )}

        {!showAspectForm && !showRegistryList && (
          <div className="input-area">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => updateState({ inputValue: e.target.value })}
              placeholder={getInputPlaceholder()}
              onKeyPress={(e) => e.key === "Enter" && handleInputSubmit()}
            />

            {/* Add Aspect button - shown in direct discovery when registry is ready */}
            {activeModule === "direct" && (registryType === "default" || registryBuilt) && (
              <button 
                className="aspect-button"
                onClick={() => {
                  updateState({ showAspectForm: true });
                  fetchSuggestedAspects();
                }}
              >
                Add Aspect
              </button>
            )}

            {/* Upload buttons - different based on module */}
            {((activeModule === "direct" && (registryType === "default" || registryBuilt)) && (
              <label className="file-upload-button">
                Upload XML
                <input 
                  type="file" 
                  onChange={(e) => handleFileChange(e, "xml")}
                  accept=".xml" 
                  hidden
                />
              </label>
            ))}

            {(activeModule === "guided" && (registryType === "default" || registryBuilt)) && (
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

            {/* Build/Send button */}
            <button 
              className="primary-button"
              onClick={getSubmitHandler()}
              disabled={isLoading}
            >
              {registryType === "custom" && !registryBuilt ? "Build Registry" : "Discover"}
            </button>
          </div>
        )}

        {showRegistryList && renderRegistryList()}
      </div>

      <div className="results-panel">
        <h3>Service Results</h3>
        {filteredServices.length > 0 ? (
          <div className="services-grid">
            {filteredServices
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
            {!isLoading && <p>No services found yet. Perform a search to see results.</p>}
          </div>
        )}
      </div>
    </div>
  );

  // Helper functions for rendering
  const getInputPlaceholder = () => {
    if (registryType === "custom" && !registryBuilt) {
      return "Enter search query to build registry (eg. microservice language:python)";
    }
    return activeModule === "direct" 
      ? "Enter your search query..." 
      : "Describe the service you need...";
  };

  const handleInputSubmit = () => {
    if (registryType === "custom" && !registryBuilt) {
      buildCustomRegistry();
    } else {
      handleSendMessage();
    }
  };

  const getSubmitHandler = () => {
    return registryType === "custom" && !registryBuilt 
      ? buildCustomRegistry 
      : handleSendMessage;
  };

  return (
    <div className="servio-container">
      {showWelcome 
        ? renderWelcomeScreen()
        : showModuleChoice 
          ? renderModuleChoice()
          : showRegistryChoice 
            ? renderRegistryChoice()
            : renderDiscoveryInterface()}

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Error</h3>
            <p>{errorMessage}</p>
            <button 
              className="primary-button" 
              onClick={() => updateState({ showPopup: false })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;