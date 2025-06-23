import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/Discovery.css";
import useScrollToTop from "../hooks/useScrollToTop";

const API_BASE_URL = "http://localhost:8000/api";

const guidedQuestions = [
  "What is your preferred programming language or technology stack?",
  "Do you have any specific requirements for authentication or security?",
  "What is your expected scale or number of users?",
  "Are there any compliance or regulatory needs?",
  "Do you have a preferred cloud provider or deployment environment?"
];

const followUpQuestions = [
  "Could you tell me more about any specific features you're looking for?",
  "Are there any performance requirements I should know about?",
  "Do you have any budget constraints to consider?",
  "Are there any integration requirements with existing systems?",
  "What about monitoring and logging requirements?",
  "Any specific availability or uptime requirements?",
  "Do you need any specific support or maintenance options?"
];

const directChatQuestions = [
  "What is the primary goal of the software?",
  "What are the key features? (comma-separated)",
  "Who is the target audience?",
  "What platform should the software be on? (web, mobile, desktop, iOS, Android, etc.)",
  "What is the expected user load?",
  "Are there any budget constraints?",
  "Are there any timeline constraints?"
];

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
    showAspectForm: false,
    postSearchStep: null,
    rating: 0,
    feedback: "",
    lastQuery: "",
    files: [],
    refining: false,
    directChatActive: false,
    directChatStep: 0,
    directChatAnswers: []
  });

  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedAnswers, setGuidedAnswers] = useState([]);
  const [followUpIndex, setFollowUpIndex] = useState(0);

  useEffect(() => {
    // Add initial message based on module type
    setState(prev => ({
      ...prev,
      messages: [
        { 
          sender: "bot", 
          text: module === "direct" 
            ? "Please enter your query and either add aspects or upload an XML file"
            : "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for?" 
        }
      ]
    }));

    if (module === "direct") {
      fetchSuggestedAspects();
    }
    if (module === "guided") {
      setGuidedStep(0);
      setGuidedAnswers([]);
    }
  }, [module]);

  const fetchSuggestedAspects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/direct/suggest-aspects`);
      const data = await response.json();
      setState(prev => ({ 
        ...prev,
        suggestedAspects: data.suggested_aspects
          .map(aspect => ({
          key: aspect,
          display: aspect.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')
        })) 
          .filter(aspect => !prev.aspects.some(usedAspect => usedAspect.key === aspect.key))
      }));
    } catch (error) {
      console.error("Error fetching aspects:", error);
      // Fallback to default aspects, filtered by already used aspects
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
        ].filter(aspect => !prev.aspects.some(usedAspect => usedAspect.key === aspect.key))
      }));
    }
  };

  const handleBack = () => {
    navigate("/registry-choice");
  };

  const handleSendMessage = async () => {
    if (!state.inputValue.trim() && !state.file) return;
  
    // Direct chat flow: just call handleUserInput
    if (state.directChatActive) {
      await handleUserInput(state.inputValue);
      return;
    }

    let newMessages = [...state.messages];

    // For direct mode, if aspects exist, show query and aspects together
    if (module === "direct" && state.aspects.length > 0) {
      let aspectsList = state.aspects.map(a => `${a.key} = ${a.value}`).join('\n');
      let queryText = state.inputValue.trim() ? `**Query:**\n${state.inputValue.trim()}` : null;
      let aspectsText = `**Aspects:**\n${aspectsList}`;
      let combinedText = queryText ? `${queryText}\n\n${aspectsText}` : aspectsText;
      newMessages.push({ sender: "user", text: combinedText });
    } else if (module === "direct" && state.file) {
      // If file is uploaded, show query and file name in chat
      let queryText = state.inputValue.trim() ? `**Query:**\n${state.inputValue.trim()}` : null;
      let fileText = `**File:**\n${state.file.name}`;
      let combinedText = queryText ? `${queryText}\n\n${fileText}` : fileText;
      newMessages.push({ sender: "user", text: combinedText });
    } else if (module === "guided") {
      await handleUserInput(state.inputValue);
      return;
    } else {
      newMessages.push({ 
        text: state.inputValue, 
        sender: "user", 
        file: state.file ? state.file.name : null 
      });
    }

    setState(prev => ({
      ...prev,
      messages: newMessages,
      lastQuery: state.inputValue,
      inputValue: "",
      file: null,
      isLoading: true,
      errorMessage: "",
    }));

    try {
      if (module === "direct" && (state.aspects.length > 0 || state.file || state.inputValue.trim())) {
        await handleDirectDiscovery(state.inputValue);
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

  const handleDirectDiscovery = async (query) => {
    if (state.aspects.length > 0) {
      const response = await fetch(`${API_BASE_URL}/direct/create-xml`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aspects: state.aspects })
      });
      const data = await response.json();
      await performDiscovery(query, data.xml_path);
    } else if (state.file) {
      const formData = new FormData();
      formData.append("file", state.file);
      
      const response = await fetch(`${API_BASE_URL}/direct/upload-xml`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      await performDiscovery(query, data.xml_path);
    } else {
      await performDiscovery(query, null);
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
      ],
      postSearchStep: formattedResults.length > 0 ? "satisfaction" : "noResults",
      aspects: prev.aspects
    }));
  }, [module]);

  const performDiscovery = useCallback((query, xmlPath) => {
    fetch(`${API_BASE_URL}/direct/discover`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query.trim(),
        xml_path: xmlPath
      })
    })
      .then(response => response.json())
      .then(data => displayResults(data));
  }, [displayResults]);

  const handleFileChange = (e, fileType = "xml") => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (module === "guided") {
      setState(prev => {
        if ((prev.files || []).length >= 10) return prev;
        return {
          ...prev,
          files: [...(prev.files || []), selectedFile]
        };
      });
    } else {
      setState(prev => ({
        ...prev,
        file: selectedFile
      }));
    }
  };

  const addAspect = () => {
    if (state.currentAspect.key && state.currentAspect.value) {
      setState(prev => ({
        ...prev,
        aspects: [...prev.aspects, state.currentAspect],
        currentAspect: { key: "", value: "" },
        showAspectForm: false,
        // Remove the used aspect from suggested aspects
        suggestedAspects: prev.suggestedAspects.filter(
          aspect => aspect.key !== prev.currentAspect.key
        )
      }));
    }
  };

  const removeAspect = (index) => {
    setState(prev => ({
      ...prev,
      aspects: prev.aspects.filter((_, i) => i !== index)
    }));
  };

  const handleSatisfactionResponse = (isSatisfied) => {
    if (isSatisfied) {
      setState(prev => ({
        ...prev,
        postSearchStep: "rating",
        refining: false
      }));
    } else if (module === "guided") {
      const nextQuestion = followUpQuestions[followUpIndex];
      setState(prev => ({
        ...prev,
        postSearchStep: null,
        inputValue: "",
        refining: true,
        messages: [
          ...prev.messages,
          {
            sender: "bot",
            text: "I understand you're not satisfied with the results. " + nextQuestion
          }
        ]
      }));
      setFollowUpIndex(prev => (prev + 1) % followUpQuestions.length);
    } else if (module === "direct") {
      setState(prev => ({
        ...prev,
        postSearchStep: "noResults"
      }));
    }
  };

  const handleFeedbackSubmit = (rating, feedback) => {
    setState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          sender: "bot",
          text: "Thank you for your valuable feedback! Your input helps us improve our service."
        }
      ],
      postSearchStep: "complete"
    }));
  };

  const handleUserInput = async (input) => {
    if (!input.trim()) return;

    // Direct chat flow
    if (state.directChatActive) {
      const nextStep = state.directChatStep + 1;
      const newAnswers = [...state.directChatAnswers, input];
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, { sender: "user", text: input }],
        inputValue: "",
        directChatAnswers: newAnswers,
        directChatStep: nextStep
      }));
      if (nextStep < directChatQuestions.length) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { sender: "bot", text: directChatQuestions[nextStep] }]
        }));
      } else {
        // All questions answered, send to API and show thank you, then results and satisfaction
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, { sender: "bot", text: "Thank you for your answers! Our AI agent will process your request." }],
          directChatActive: false,
          isLoading: true
        }));
        try {
          const response = await fetch("/api/direct/ai-agent-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers: newAnswers })
          });
          const data = await response.json();
          setState(prev => ({
            ...prev,
            isLoading: false,
            messages: [
              ...prev.messages,
              { sender: "bot", text: (data && data.results && data.results.length > 0) ? "Results found." : "No results found." }
            ],
            filteredServices: (data && data.results) ? data.results : [],
            postSearchStep: "satisfaction"
          }));
        } catch (e) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            messages: [
              ...prev.messages,
              { sender: "bot", text: "No results found." }
            ],
            filteredServices: [],
            postSearchStep: "satisfaction"
          }));
        }
      }
      return;
    }

    let currentStep = guidedStep;
    let allAnswers = [...guidedAnswers, input];

    if (module === "guided" && !state.refining && currentStep < guidedQuestions.length) {
      setGuidedAnswers(allAnswers);
      setGuidedStep(currentStep + 1);
      setState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          { sender: "user", text: input, files: (state.files || []).map(f => f.name) },
          { sender: "bot", text: guidedQuestions[currentStep] }
        ],
        lastQuery: input,
        inputValue: "",
        file: null,
        isLoading: false,
        errorMessage: "",
        files: []
      }));
      return;
    }

    // If in refinement or all questions are answered, perform search
    if (module === "guided" && (state.refining || currentStep >= guidedQuestions.length)) {
      setGuidedAnswers(allAnswers);
      setGuidedStep(currentStep + 1);
      setState(prev => ({
        ...prev,
        isLoading: true,
        refining: false,
        messages: [
          ...prev.messages,
          { sender: "user", text: input, files: (state.files || []).map(f => f.name) }
        ],
        files: []
      }));
      const fullQuery = allAnswers.filter(Boolean).join(". ");
      try {
        const response = await fetch(`${API_BASE_URL}/guided/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: fullQuery })
        });
        const data = await response.json();
        displayResults(data);
      } catch (error) {
        setState(prev => ({
          ...prev,
          errorMessage: error.message || "An error occurred. Please try again.",
          showPopup: true,
          isLoading: false
        }));
      }
      return;
    }

    // ... existing direct mode logic ...
  };

  useScrollToTop();

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
              <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') }} />
              {msg.file && <div className="file-attachment">�� {msg.file}</div>}
              {msg.files && Array.isArray(msg.files) && msg.files.map((fname, idx) => (
                <div key={idx} className="file-attachment">📎 {fname}</div>
              ))}
            </div>
          ))}
          {state.isLoading && state.postSearchStep !== null && <div className="message bot">Processing...</div>}
        </div>

        {module === "direct" && state.showAspectForm && (
          <div className="aspect-form">
            <h3>Add Aspect</h3>
            <div className="aspect-suggestions">
              <p>Suggested aspects:</p>
              <div className="suggestion-tags">
                {(state.suggestedAspects || []).map((aspect, i) => (
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
              <div className="input-row">
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
            </div>
            
            <div className="form-group">
              <div className="input-row">
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

        {!state.directChatActive && !state.postSearchStep && (state.aspects || []).length > 0 && (
          <div className="aspects-list">
            <h4>Current Aspects</h4>
            {(state.aspects || []).map((aspect, i) => (
              <div key={i} className="aspect-item">
                <span>{aspect.key}: {aspect.value}</span>
                <button onClick={() => removeAspect(i)}>×</button>
              </div>
            ))}
            <div className="aspect-actions">
              {!state.showAspectForm && !state.file && (
                <button
                  className="aspect-button"
                  onClick={() => {
                    setState(prev => ({ ...prev, showAspectForm: true }));
                    fetchSuggestedAspects();
                  }}
                >
                  Add More
                </button>
              )}
            </div>
          </div>
        )}

        {state.file && !state.showAspectForm && !state.postSearchStep && (state.aspects || []).length === 0 && (
          <div className="uploaded-file-box">
            <span>Uploaded file: {state.file.name}</span>
            <button className="remove-file-btn" onClick={() => setState(prev => ({ ...prev, file: null }))}>×</button>
          </div>
        )}

        {!state.directChatActive && module === "direct" && !(state.aspects || []).length && !state.showAspectForm && !state.file && !state.postSearchStep && (
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

        {module === "guided" && (state.files || []).length > 0 && !state.showAspectForm && !state.postSearchStep && (
          <div className="uploaded-file-box">
            <span>Uploaded files:</span>
            <ul style={{margin: 0, padding: 0, listStyle: 'none'}}>
              {(state.files || []).map((file, idx) => (
                <li key={idx} style={{display: 'flex', alignItems: 'center', marginBottom: 4}}>
                  <span style={{marginRight: 8}}>📎 {file.name}</span>
                  <button className="remove-file-btn" onClick={() => setState(prev => ({
                    ...prev,
                    files: prev.files.filter((_, i) => i !== idx)
                  }))}>×</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!state.postSearchStep ? (
        <div className="input-area">
          <input
            type="text"
            value={state.directChatActive ? state.inputValue : (module === "direct" && (state.filteredServices || []).length > 0 ? state.lastQuery : state.inputValue)}
            onChange={(e) => setState(prev => ({ ...prev, inputValue: e.target.value }))}
            placeholder={state.directChatActive ? directChatQuestions[state.directChatStep] : (module === "direct" ? "Enter your search query..." : "Describe the service you need...")}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={state.directChatActive ? false : (module === "direct" ? (state.filteredServices || []).length > 0 || (!state.directChatActive && !!state.postSearchStep) : false)}
          />
          <div className="upload-buttons">
            {module === "direct" ? (
                <label className={`file-upload-button ${((state.filteredServices || []).length > 0) ? 'disabled' : ''}`}>
                Upload XML
                <input 
                  type="file" 
                  onChange={(e) => handleFileChange(e, "xml")}
                  accept=".xml" 
                  hidden
                    disabled={(state.filteredServices || []).length > 0}
                />
              </label>
            ) : (
              <>
                  <label className={`file-upload-button ${(state.files || []).length >= 10 ? 'disabled' : ''}`}>
                  Upload XML
                  <input 
                    type="file" 
                    onChange={(e) => handleFileChange(e, "xml")}
                    accept=".xml" 
                    hidden
                      disabled={(state.files || []).length >= 10}
                  />
                </label>
                  <label className={`file-upload-button ${(state.files || []).length >= 10 ? 'disabled' : ''}`}>
                  Upload JSON
                  <input 
                    type="file" 
                    onChange={(e) => handleFileChange(e, "json")}
                    accept=".json" 
                    hidden
                      disabled={(state.files || []).length >= 10}
                  />
                </label>
                  <label className={`file-upload-button ${(state.files || []).length >= 10 ? 'disabled' : ''}`}>
                  Upload UML
                  <input 
                    type="file" 
                    onChange={(e) => handleFileChange(e, "uml")}
                    accept=".uml,.plantuml,.puml" 
                    hidden
                      disabled={(state.files || []).length >= 10}
                  />
                </label>
                  <label className={`file-upload-button ${(state.files || []).length >= 10 ? 'disabled' : ''}`}>
                  Upload PDF
                  <input 
                    type="file" 
                    onChange={(e) => handleFileChange(e, "pdf")}
                    accept=".pdf" 
                    hidden
                      disabled={(state.files || []).length >= 10}
                  />
                </label>
              </>
            )}
          </div>
          <button 
            className="primary-button"
            onClick={handleSendMessage}
            disabled={state.isLoading}
          >
            Discover
          </button>
        </div>
        ) : state.postSearchStep === "satisfaction" ? (
          <div className="post-search-ui">
            <p>Are you satisfied with the results?</p>
            <div className="post-search-actions">
              <button className="primary-button" onClick={() => handleSatisfactionResponse(true)}>Yes</button>
              <button className="secondary-button" onClick={() => handleSatisfactionResponse(false)}>No</button>
            </div>
          </div>
        ) : state.postSearchStep === "rating" ? (
          <div className="post-search-ui">
            <p>Please rate your experience:</p>
            <div className="post-search-rating">
              <span>Rating: </span>
              {[1,2,3,4,5].map(star => (
                <span key={star} style={{cursor: 'pointer', fontSize: '1.2em'}} onClick={() => setState(prev => ({...prev, rating: star}))}>
                  {state.rating >= star ? '★' : '☆'}
                </span>
              ))}
            </div>
            <textarea
              className="post-search-feedback"
              placeholder="Your feedback..."
              value={state.feedback || ''}
              onChange={e => setState(prev => ({...prev, feedback: e.target.value}))}
              rows={2}
              style={{width: '100%', margin: '10px 0'}}
            />
            <button className="primary-button" onClick={() => handleFeedbackSubmit(state.rating, state.feedback)} disabled={!state.rating}>Submit</button>
          </div>
        ) : state.postSearchStep === "complete" ? (
          <div className="post-search-ui" style={{color: 'black', textAlign: 'center'}}>
            <p>Thank you for your feedback!</p>
            <button 
              className="primary-button"
              style={{marginTop: '16px'}}
              onClick={() => {
                // Reset everything for new discovery
                setState({
                  messages: [{
                    sender: "bot",
                    text: "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for?"
                  }],
                  filteredServices: [],
                  inputValue: "",
                  lastQuery: "",
                  aspects: [],
                  showAspectForm: false,
                  postSearchStep: null,
                  rating: 0,
                  feedback: "",
                  files: [],
                  directChatActive: false,
                  directChatStep: 0,
                  directChatAnswers: []
                });
                setFollowUpIndex(0);
              }}
            >
              New Discovery
            </button>
          </div>
        ) : state.postSearchStep === "noResults" ? (
          <div className="post-search-ui">
            <p>No matching services found. What would you like to do?</p>
            <div className="post-search-actions">
              {module === "direct" ? (
                <>
                  <button 
                    className="primary-button" 
                    onClick={() => { 
                      setState(prev => ({ 
                        ...prev, 
                        postSearchStep: null,
                        showAspectForm: false,
                        aspects: prev.aspects,
                        inputValue: prev.lastQuery
                      })); 
                    }}
                  >
                    Add More Aspects
                  </button>
                  <button className="secondary-button" onClick={() => {
                    setState(prev => ({
                      ...prev,
                      directChatActive: true,
                      directChatStep: 0,
                      directChatAnswers: [],
                      messages: [
                        ...prev.messages,
                        { sender: "bot", text: directChatQuestions[0] }
                      ],
                      postSearchStep: null,
                      inputValue: ""
                    }));
                  }}>
                    Chat with AI Agent
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="primary-button" 
                    onClick={() => { 
                      setState(prev => ({ 
                        ...prev, 
                        postSearchStep: null,
                        inputValue: prev.lastQuery,
                        messages: [
                          ...prev.messages,
                          {
                            sender: "bot",
                            text: "Let's continue our conversation. How else can I help you find a suitable service?"
                          }
                        ]
                      })); 
                    }}
                  >
                    Continue chatting with RAG chatbot
                  </button>
                  <button 
                    className="secondary-button" 
                    onClick={() => { 
                      setState({
                        messages: [
                          { 
                            sender: "bot", 
                            text: "Hello! This is Servio AI Assistant, your smart assistant for efficient service discovery. What are the details of the service you are looking for?" 
                          }
                        ],
                        inputValue: "",
                        filteredServices: [],
                        isLoading: false,
                        errorMessage: "",
                        showPopup: false,
                        file: null,
                        aspects: [],
                        currentAspect: { key: "", value: "" },
                        suggestedAspects: [],
                        showAspectForm: false,
                        postSearchStep: null,
                        rating: 0,
                        feedback: "",
                        lastQuery: "",
                        files: []
                      }); 
                    }}
                  >
                    Start over
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="results-panel">
        <h3>Service Results</h3>
        {((state.filteredServices || []).length > 0) ? (
          <div className="services-grid">
            {((state.filteredServices || []).sort((a, b) => b.confidence - a.confidence)).map((service, i) => (
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