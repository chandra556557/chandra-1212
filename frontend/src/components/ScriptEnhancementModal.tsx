import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ScriptEnhancementModal.css';

const API_URL = 'http://localhost:3001/api';

interface Project {
  id: string;
  name: string;
}

interface Script {
  id: string;
  name: string;
  language: string;
  projectId: string;
}

interface EnhancementSuggestion {
  lineNumber: number;
  originalCode: string;
  suggestedCode: string;
  reason: string;
  confidence: number;
  category: string;
}

interface EnhancementData {
  scriptId: string;
  scriptName: string;
  originalCode: string;
  enhancedCode: string;
  suggestions: EnhancementSuggestion[];
  diff: Array<{ line: number; type: string; content: string }>;
  summary: {
    totalSuggestions: number;
    byCategory: Record<string, number>;
    estimatedImprovement: number;
  };
}

interface ScriptEnhancementModalProps {
  scriptId?: string;
  scriptName?: string;
  onClose: () => void;
  onApply: () => void;
}

export const ScriptEnhancementModal: React.FC<ScriptEnhancementModalProps> = ({
  scriptId: initialScriptId,
  scriptName: initialScriptName,
  onClose,
  onApply
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedScriptId, setSelectedScriptId] = useState<string>(initialScriptId || '');
  const [selectedScriptName, setSelectedScriptName] = useState<string>(initialScriptName || '');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [enhancement, setEnhancement] = useState<EnhancementData | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'suggestions' | 'diff'>('suggestions');
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('accessToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadScripts(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedScriptId) {
      loadEnhancement();
    }
  }, [selectedScriptId]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${API_URL}/projects`, { headers });
      console.log('Projects loaded:', res.data);
      setProjects(res.data.data || []);
      
      // If initialScriptId provided, find its project
      if (initialScriptId && res.data.data?.length > 0) {
        const scriptRes = await axios.get(`${API_URL}/scripts/${initialScriptId}`, { headers });
        const script = scriptRes.data.data;
        console.log('Initial script loaded:', script);
        if (script) {
          setSelectedProjectId(script.projectId);
        }
      }
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err.response?.data?.error || 'Failed to load projects. Please ensure you are logged in.');
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadScripts = async (projectId: string) => {
    try {
      console.log('Loading scripts for project:', projectId);
      const res = await axios.get(`${API_URL}/scripts`, { headers, params: { projectId } });
      console.log('Scripts loaded:', res.data);
      const scriptList = res.data.data || res.data.scripts || [];
      setScripts(scriptList);
      
      // Auto-select if initialScriptId is in this project
      if (initialScriptId && !selectedScriptId) {
        setSelectedScriptId(initialScriptId);
      }
    } catch (err: any) {
      console.error('Failed to load scripts:', err);
      setError(err.response?.data?.error || 'Failed to load scripts for this project.');
    }
  };

  const loadEnhancement = async () => {
    if (!selectedScriptId) return;
    
    console.log('Loading enhancement for script:', selectedScriptId);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        `${API_URL}/scripts/${selectedScriptId}/enhance`,
        {},
        { headers }
      );
      console.log('Enhancement data received:', res.data);
      const data: EnhancementData = res.data.data;
      setEnhancement(data);
      setSelectedScriptName(data.scriptName);
      
      // Pre-select high-confidence suggestions
      const highConfidence = new Set(
        data.suggestions
          .filter(s => s.confidence >= 0.8)
          .map((_, idx) => idx)
      );
      setSelectedSuggestions(highConfidence);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to analyze script';
      console.error('Enhancement error:', err);
      console.error('Error details:', err.response?.data);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSuggestions(newSelected);
  };

  const applyEnhancements = async () => {
    if (!enhancement) return;

    setApplying(true);
    try {
      // Use the enhanced code from backend or build it from selected suggestions
      let finalCode = enhancement.enhancedCode;
      
      // If user deselected some suggestions, rebuild the code
      if (selectedSuggestions.size !== enhancement.suggestions.length) {
        const lines = enhancement.originalCode.split('\n');
        const selectedSuggestionsList = enhancement.suggestions
          .filter((_, idx) => selectedSuggestions.has(idx))
          .sort((a, b) => b.lineNumber - a.lineNumber);

        selectedSuggestionsList.forEach(suggestion => {
          if (suggestion.lineNumber < lines.length) {
            lines[suggestion.lineNumber] = suggestion.suggestedCode;
          }
        });
        finalCode = lines.join('\n');
      }

      const response = await axios.post(
        `${API_URL}/scripts/${selectedScriptId}/apply-enhancement`,
        { enhancedCode: finalCode },
        { headers }
      );

      alert('✅ ' + (response.data.message || 'Script enhanced successfully!'));
      onApply();
      onClose();
    } catch (err: any) {
      alert('Failed to apply enhancements: ' + (err.response?.data?.error || err.message));
    } finally {
      setApplying(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      locator: '#3b82f6',
      wait: '#f59e0b',
      'error-handling': '#ef4444',
      'best-practice': '#10b981'
    };
    return colors[category] || '#6b7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      locator: '🎯',
      wait: '⏱️',
      'error-handling': '🛡️',
      'best-practice': '✨'
    };
    return icons[category] || '📝';
  };

  if (loadingProjects) {
    return (
      <div className="modal-overlay">
        <div className="enhancement-modal">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="enhancement-modal">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Analyzing script for improvements...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="enhancement-modal">
          <div className="error-state">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!enhancement) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="enhancement-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>🚀 AI Script Enhancement</h2>
              <p className="script-name">Select a script to enhance</p>
            </div>
            <button onClick={onClose} className="close-btn">×</button>
          </div>

          <div className="script-selector">
            {projects.length === 0 ? (
              <div className="empty-state">
                <p style={{ marginBottom: '16px' }}>⚠️ No projects found. Please create a project first.</p>
                <button onClick={onClose} className="btn-primary">Close</button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="project-select">📁 Select Project</label>
                  <select 
                    id="project-select"
                    value={selectedProjectId} 
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedScriptId('');
                      setEnhancement(null);
                    }}
                    className="form-select"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map(proj => (
                      <option key={proj.id} value={proj.id}>{proj.name}</option>
                    ))}
                  </select>
                </div>

                {selectedProjectId && (
                  <div className="form-group">
                    <label htmlFor="script-select">📝 Select Script</label>
                    {scripts.length === 0 ? (
                      <p style={{ color: '#f59e0b', marginTop: '8px' }}>⚠️ No scripts found in this project. Please create or import a script first.</p>
                    ) : (
                      <select 
                        id="script-select"
                        value={selectedScriptId} 
                        onChange={(e) => {
                          setSelectedScriptId(e.target.value);
                          const script = scripts.find(s => s.id === e.target.value);
                          if (script) {
                            setSelectedScriptName(script.name);
                          }
                        }}
                        className="form-select"
                      >
                        <option value="">Choose a script...</option>
                        {scripts.map(script => (
                          <option key={script.id} value={script.id}>
                            {script.name} ({script.language})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {selectedScriptId && (
                  <button 
                    onClick={loadEnhancement}
                    className="btn-primary"
                    style={{ marginTop: '16px', width: '100%' }}
                  >
                    🚀 Analyze Script
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="enhancement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>🚀 AI Script Enhancement</h2>
            <p className="script-name">{selectedScriptName}</p>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="enhancement-summary">
          <div className="summary-card">
            <div className="summary-icon">💡</div>
            <div>
              <div className="summary-value">{enhancement.summary.totalSuggestions}</div>
              <div className="summary-label">Suggestions</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div>
              <div className="summary-value">{enhancement.summary.estimatedImprovement}%</div>
              <div className="summary-label">Est. Improvement</div>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div>
              <div className="summary-value">{selectedSuggestions.size}</div>
              <div className="summary-label">Selected</div>
            </div>
          </div>
        </div>

        <div className="view-tabs">
          <button
            className={`tab ${viewMode === 'suggestions' ? 'active' : ''}`}
            onClick={() => setViewMode('suggestions')}
          >
            📝 Suggestions
          </button>
          <button
            className={`tab ${viewMode === 'diff' ? 'active' : ''}`}
            onClick={() => setViewMode('diff')}
          >
            🔄 Code Diff
          </button>
        </div>

        <div className="modal-content">
          {viewMode === 'suggestions' ? (
            <div className="suggestions-list">
              {enhancement.suggestions.length === 0 ? (
                <div className="no-suggestions">
                  <p>✨ Great! No improvements needed - your script looks good!</p>
                </div>
              ) : (
                enhancement.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-card ${selectedSuggestions.has(index) ? 'selected' : ''}`}
                  >
                    <div className="suggestion-header">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.has(index)}
                        onChange={() => toggleSuggestion(index)}
                      />
                      <span
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(suggestion.category) }}
                      >
                        {getCategoryIcon(suggestion.category)} {suggestion.category}
                      </span>
                      <span className="confidence-badge">
                        {Math.round(suggestion.confidence * 100)}% confidence
                      </span>
                      <span className="line-number">Line {suggestion.lineNumber}</span>
                    </div>
                    <p className="suggestion-reason">{suggestion.reason}</p>
                    <div className="code-comparison">
                      <div className="code-block original">
                        <div className="code-label">Original</div>
                        <pre>{suggestion.originalCode}</pre>
                      </div>
                      <div className="arrow">→</div>
                      <div className="code-block suggested">
                        <div className="code-label">Suggested</div>
                        <pre>{suggestion.suggestedCode}</pre>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="diff-view">
              <div className="diff-container">
                {enhancement.diff.map((line, idx) => (
                  <div key={idx} className={`diff-line ${line.type}`}>
                    <span className="line-num">{line.line + 1}</span>
                    <span className="line-content">{line.content}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary" disabled={applying}>
            Cancel
          </button>
          <button
            onClick={applyEnhancements}
            className="btn-primary"
            disabled={applying || selectedSuggestions.size === 0}
          >
            {applying ? 'Applying...' : `Apply ${selectedSuggestions.size} Enhancement${selectedSuggestions.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptEnhancementModal;
