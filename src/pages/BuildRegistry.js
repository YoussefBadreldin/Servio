import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/BuildRegistry.css";

const API_BASE_URL = "http://localhost:8000/api";
const DEFAULT_REGISTRY_LIMIT = 5;

const BuildRegistry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { module } = location.state || {};

  const [state, setState] = useState({
    inputValue: "",
    isLoading: false,
    errorMessage: "",
    showPopup: false,
    availableRegistries: [],
    selectedRegistry: null
  });

  useEffect(() => {
    fetchRegistries();
  }, []);

  const fetchRegistries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/registry_builder/list_registries`);
      const data = await response.json();
      setState(prev => ({ ...prev, availableRegistries: data.registries || [] }));
    } catch (error) {
      console.error("Error fetching registries:", error);
    }
  };

  const handleBack = () => {
    navigate("/registry-choice");
  };

  const buildCustomRegistry = async () => {
    if (!state.inputValue.trim()) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/registry_builder/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: state.inputValue, 
          limit: DEFAULT_REGISTRY_LIMIT 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate("/discovery", { 
          state: { 
            module,
            registryType: "custom",
            registryPath: data.registry_path
          }
        });
      } else {
        throw new Error(data.message || "Failed to build registry");
      }
    } catch (error) {
      console.error("Error building registry:", error);
      setState(prev => ({
        ...prev,
        errorMessage: error.message,
        showPopup: true
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadRegistry = async (registryPath) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/direct/set-registry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registry_path: registryPath })
      });
      
      const data = await response.json();
      
      if (data.success) {
        navigate("/discovery", { 
          state: { 
            module,
            registryType: "custom",
            registryPath
          }
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error loading registry:", error);
      setState(prev => ({
        ...prev,
        errorMessage: error.message,
        showPopup: true
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <div className="registry-list">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
      <h3>Build or Select Registry</h3>
      
      <div className="build-registry-section">
        <input
          type="text"
          value={state.inputValue}
          onChange={(e) => setState(prev => ({ ...prev, inputValue: e.target.value }))}
          placeholder="Enter search query to build registry (eg. microservice language:python)"
        />
        <button 
          className="primary-button"
          onClick={buildCustomRegistry}
          disabled={state.isLoading || !state.inputValue.trim()}
        >
          Build New Registry
        </button>
      </div>

      <div className="registry-options">
        {state.availableRegistries.length > 0 ? (
          <>
            <h4>Available Custom Registries</h4>
            {state.availableRegistries.map((registry, i) => (
              <div 
                key={i} 
                className="registry-option"
                onClick={() => loadRegistry(registry)}
              >
                <div className="registry-name">{registry.split('/').pop()}</div>
                <div className="registry-path">{registry}</div>
              </div>
            ))}
          </>
        ) : (
          <div className="no-registries">
            <p>No existing custom registries found.</p>
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

export default BuildRegistry; 