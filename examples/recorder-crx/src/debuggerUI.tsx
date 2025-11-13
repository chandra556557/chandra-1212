/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from 'react';
import { debuggerService, ExecutionContext, VariableInfo } from './debuggerService';

interface DebuggerPanelProps {
  fileId?: string;
  currentLine?: number;
  onLineClick?: (line: number) => void;
  onClose?: () => void;
}

export const DebuggerPanel: React.FC<DebuggerPanelProps> = ({ fileId, currentLine, onLineClick, onClose }) => {
  const [executionContext, setExecutionContext] = React.useState<ExecutionContext | null>(null);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  const [expression, setExpression] = React.useState<string>('');
  const [evalResult, setEvalResult] = React.useState<string>('');

  // Set up pause callback
  React.useEffect(() => {
    debuggerService.setPauseCallback(() => {
      const context = debuggerService.getExecutionContext();
      setExecutionContext(context);
      setIsPaused(context?.status === 'paused');
    });
  }, []);

  const handleResume = () => {
    debuggerService.resume();
    setExecutionContext(null);
    setIsPaused(false);
  };

  const handleStepOver = () => {
    debuggerService.stepOver();
    setExecutionContext(null);
    setIsPaused(false);
  };

  const handleStepInto = () => {
    debuggerService.stepInto();
    setExecutionContext(null);
    setIsPaused(false);
  };

  const handleStepOut = () => {
    debuggerService.stepOut();
    setExecutionContext(null);
    setIsPaused(false);
  };

  const handleEvaluate = async () => {
    if (expression.trim()) {
      try {
        const result = await debuggerService.evaluateExpression(expression);
        setEvalResult(result);
      } catch (error) {
        setEvalResult(`Error: ${error.message}`);
      }
    }
  };

  const handleLineClick = (line: number) => {
    if (onLineClick) {
      onLineClick(line);
    }
  };

  return (
    <div className="debugger-panel">
      <div className="debugger-header">
        <h3>Debugger</h3>
        {isPaused && executionContext && (
          <div className="current-line">
            Paused at line {executionContext.currentLine}
          </div>
        )}
        {onClose && (
          <button onClick={onClose} style={{ marginLeft: 'auto' }}>Close</button>
        )}
      </div>

      {isPaused && executionContext ? (
        <div className="debugger-content">
          <div className="debugger-controls">
            <button onClick={handleResume}>Resume (F8)</button>
            <button onClick={handleStepOver}>Step Over (F10)</button>
            <button onClick={handleStepInto}>Step Into (F11)</button>
            <button onClick={handleStepOut}>Step Out (Shift+F11)</button>
          </div>

          <div className="variables-section">
            <h4>Variables</h4>
            <div className="variables-list">
              {executionContext.variables.map((variable: VariableInfo) => (
                <div key={variable.name} className="variable-item">
                  <span className="variable-name">{variable.name}:</span>
                  <span className="variable-value">{variable.value}</span>
                  <span className="variable-type">({variable.type})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="eval-section">
            <h4>Evaluate Expression</h4>
            <div className="eval-input">
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="Enter expression to evaluate"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEvaluate();
                  }
                }}
              />
              <button onClick={handleEvaluate}>Evaluate</button>
            </div>
            {evalResult && (
              <div className="eval-result">
                <pre>{evalResult}</pre>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="debugger-info">
          <p>Execution is running normally.</p>
          <p>Click on line numbers in the editor to add breakpoints.</p>
        </div>
      )}
    </div>
  );
};

// Export a simple wrapper
export const DebuggerUI: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  return <DebuggerPanel onClose={onClose} />;
};
