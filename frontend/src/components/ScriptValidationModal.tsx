import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ScriptValidationModal.css';

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

interface DiffLine {
  line: number;
  type: 'added' | 'removed' | 'unchanged';
  content: string;
}

interface EnhancementData {
  scriptId: string;
  scriptName: string;
  originalCode: string;
  enhancedCode: string;
  suggestions: EnhancementSuggestion[];
  diff: DiffLine[];
  summary: {
    totalSuggestions: number;
    byCategory: Record<string, number>;
    estimatedImprovement: number;
  };
}

interface ScriptValidationModalProps {
  scriptId?: string;
  scriptName?: string;
  onClose: () => void;
}

export const ScriptValidationModal: React.FC<ScriptValidationModalProps> = ({
  scriptId: initialScriptId,
  scriptName: initialScriptName,
  onClose
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedScriptId, setSelectedScriptId] = useState<string>(initialScriptId || '');
  const [selectedScriptName, setSelectedScriptName] = useState<string>(initialScriptName || '');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingEnhancement, setLoadingEnhancement] = useState(false);
  const [enhancement, setEnhancement] = useState<EnhancementData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());
  const [applying, setApplying] = useState(false);

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
      loadEnhancementData();
    }
  }, [selectedScriptId]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await axios.get(`${API_URL}/projects`, { headers });
      console.log('Projects loaded:', res.data);
      setProjects(res.data.data || []);
      
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
      setError(err.response?.data?.error || 'Failed to load projects.');
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
      
      if (initialScriptId && !selectedScriptId) {
        setSelectedScriptId(initialScriptId);
      }
    } catch (err: any) {
      console.error('Failed to load scripts:', err);
      setError(err.response?.data?.error || 'Failed to load scripts.');
    }
  };

  const loadEnhancementData = async () => {
    if (!selectedScriptId) return;

    setLoadingEnhancement(true);
    setError(null);
    try {
      const res = await axios.get(
        `${API_URL}/scripts/${selectedScriptId}/enhancement-for-validation`,
        { headers }
      );
      console.log('Enhancement data loaded:', res.data);
      const data: EnhancementData = res.data.data;
      console.log('Original Code Length:', data.originalCode?.length);
      console.log('Enhanced Code Length:', data.enhancedCode?.length);
      console.log('Suggestions Count:', data.suggestions?.length);
      setEnhancement(data);
      setSelectedScriptName(data.scriptName);

      // Pre-select all high-confidence suggestions
      const highConfidence = new Set(
        data.suggestions
          .filter(s => s.confidence >= 0.8)
          .map((_, idx) => idx)
      );
      setSelectedSuggestions(highConfidence);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load enhancement data';
      console.error('Enhancement error:', err);
      setError(errorMsg);
    } finally {
      setLoadingEnhancement(false);
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

  const applyValidatedEnhancements = async () => {
    if (!enhancement) return;

    setApplying(true);
    try {
      // Use enhanced code from backend or rebuild if user deselected some
      let finalCode = enhancement.enhancedCode;
      
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

      alert('✅ ' + (response.data.message || 'Script validated and enhanced successfully!'));
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
        <div className="validation-modal">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingEnhancement) {
    return (
      <div className="modal-overlay">
        <div className="validation-modal">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading enhancement data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedScriptId) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="validation-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h2>🔍 Selector Validation</h2>
              <p className="script-name">Select a script to validate</p>
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
                      <p style={{ color: '#f59e0b', marginTop: '8px' }}>⚠️ No scripts found in this project.</p>
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
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="validation-modal validation-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>✅ Human Validation - Code Review</h2>
            <p className="script-name">{selectedScriptName}</p>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        {error && (
          <div className="error-banner">
            ❌ {error}
          </div>
        )}

        {enhancement && (
          <>
            <div className="validation-summary">
              <div className="summary-card">
                <div className="summary-icon">💡</div>
                <div>
                  <div className="summary-value">{enhancement.summary.totalSuggestions}</div>
                  <div className="summary-label">AI Suggestions</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">✅</div>
                <div>
                  <div className="summary-value">{selectedSuggestions.size}</div>
                  <div className="summary-label">Accepted</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">📊</div>
                <div>
                  <div className="summary-value">{enhancement.summary.estimatedImprovement}%</div>
                  <div className="summary-label">Est. Improvement</div>
                </div>
              </div>
            </div>

            <div className="modal-content">
              <div className="diff-container-side-by-side">
                <div className="diff-pane">
                  <div className="diff-pane-header">
                    <h3>📄 Original Script</h3>
                  </div>
                  <div className="diff-pane-content">
                    <pre className="code-block">
                      {enhancement.originalCode.split('\n').map((line, idx) => {
                        // Check if this line has a suggestion (will be replaced)
                        const hasSuggestion = enhancement.suggestions.find(s => s.lineNumber === idx);
                        return (
                          <div
                            key={idx}
                            className={hasSuggestion ? 'code-line-removed' : 'code-line'}
                          >
                            <span className="line-number">{idx + 1}</span>
                            <span className="line-content">{line || ' '}</span>
                          </div>
                        );
                      })}
                    </pre>
                  </div>
                </div>

                <div className="diff-pane">
                  <div className="diff-pane-header">
                    <h3>✨ Enhanced Script (AI Suggestions)</h3>
                  </div>
                  <div className="diff-pane-content">
                    <pre className="code-block">
                      {enhancement.enhancedCode.split('\n').map((line, idx) => {
                        // Check if this line was changed by AI
                        const hasSuggestion = enhancement.suggestions.find(s => s.lineNumber === idx);
                        return (
                          <div
                            key={idx}
                            className={hasSuggestion ? 'code-line-added' : 'code-line'}
                          >
                            <span className="line-number">{idx + 1}</span>
                            <span className="line-content">{line || ' '}</span>
                          </div>
                        );
                      })}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="suggestions-list" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '16px' }}>🔍 Review & Accept Suggestions</h3>
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
                        <span className="line-number">Line {suggestion.lineNumber + 1}</span>
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
            </div>
          </>
        )}

        {!enhancement && !loadingEnhancement && (
          <div className="empty-state">
            <p>⏳ Analyzing script for improvements...</p>
          </div>
        )}

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary" disabled={applying}>
            Cancel
          </button>
          <button
            onClick={applyValidatedEnhancements}
            className="btn-primary"
            disabled={applying || !enhancement || selectedSuggestions.size === 0}
          >
            {applying ? 'Applying...' : `✅ Accept & Save ${selectedSuggestions.size} Enhancement${selectedSuggestions.size !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScriptValidationModal;
