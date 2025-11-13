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

export interface Breakpoint {
  id: string;
  line: number;
  enabled: boolean;
  condition?: string;
}

export interface VariableInfo {
  name: string;
  value: string;
  type: string;
}

export interface ExecutionContext {
  variables: VariableInfo[];
  currentLine: number;
  status: 'running' | 'paused' | 'finished';
}

export class DebuggerService {
  private breakpoints: Map<string, Breakpoint[]> = new Map();
  private executionContext: ExecutionContext | null = null;
  private isPaused: boolean = false;
  private pauseCallback: (() => void) | null = null;

  /**
   * Add a breakpoint to a file
   */
  async addBreakpoint(fileId: string, line: number, condition?: string): Promise<Breakpoint> {
    const breakpoint: Breakpoint = {
      id: Math.random().toString(36).substr(2, 9),
      line,
      enabled: true,
      condition
    };

    const fileBreakpoints = this.breakpoints.get(fileId) || [];
    fileBreakpoints.push(breakpoint);
    this.breakpoints.set(fileId, fileBreakpoints);

    // Save to storage
    await this.saveBreakpoints(fileId);

    return breakpoint;
  }

  /**
   * Remove a breakpoint
   */
  async removeBreakpoint(fileId: string, breakpointId: string): Promise<void> {
    const fileBreakpoints = this.breakpoints.get(fileId) || [];
    const updatedBreakpoints = fileBreakpoints.filter(bp => bp.id !== breakpointId);
    this.breakpoints.set(fileId, updatedBreakpoints);

    // Save to storage
    await this.saveBreakpoints(fileId);
  }

  /**
   * Toggle breakpoint enabled state
   */
  async toggleBreakpoint(fileId: string, breakpointId: string): Promise<void> {
    const fileBreakpoints = this.breakpoints.get(fileId) || [];
    const breakpoint = fileBreakpoints.find(bp => bp.id === breakpointId);

    if (breakpoint) {
      breakpoint.enabled = !breakpoint.enabled;
      this.breakpoints.set(fileId, fileBreakpoints);

      // Save to storage
      await this.saveBreakpoints(fileId);
    }
  }

  /**
   * Get breakpoints for a file
   */
  async getBreakpoints(fileId: string): Promise<Breakpoint[]> {
    // Try to load from storage first
    try {
      const result = await chrome.storage.local.get([`breakpoints_${fileId}`]);
      if (result[`breakpoints_${fileId}`]) {
        return result[`breakpoints_${fileId}`];
      }
    } catch (error) {
      console.error('Error loading breakpoints:', error);
    }

    // Fallback to in-memory
    return this.breakpoints.get(fileId) || [];
  }

  /**
   * Save breakpoints to storage
   */
  private async saveBreakpoints(fileId: string): Promise<void> {
    try {
      const fileBreakpoints = this.breakpoints.get(fileId) || [];
      await chrome.storage.local.set({
        [`breakpoints_${fileId}`]: fileBreakpoints
      });
    } catch (error) {
      console.error('Error saving breakpoints:', error);
    }
  }

  /**
   * Check if there's a breakpoint at the specified line
   */
  async hasBreakpointAtLine(fileId: string, line: number): Promise<boolean> {
    const breakpoints = await this.getBreakpoints(fileId);
    return breakpoints.some(bp => bp.line === line && bp.enabled);
  }

  /**
   * Pause execution at a breakpoint
   */
  async pauseAtBreakpoint(fileId: string, line: number): Promise<void> {
    // Get current variables (simplified for this example)
    const variables: VariableInfo[] = [
      { name: 'url', value: 'https://example.com', type: 'string' },
      { name: 'title', value: 'Example Page', type: 'string' },
      { name: 'elements', value: '15', type: 'number' }
    ];

    this.executionContext = {
      variables,
      currentLine: line,
      status: 'paused'
    };

    this.isPaused = true;

    // Notify listeners that execution is paused
    if (this.pauseCallback) {
      this.pauseCallback();
    }

    // Wait until resumed
    return new Promise<void>(resolve => {
      const checkResume = () => {
        if (!this.isPaused) {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }

  /**
   * Resume execution
   */
  resume(): void {
    this.isPaused = false;
    this.executionContext = null;
  }

  /**
   * Step over to next line
   */
  stepOver(): void {
    // In a real implementation, this would execute the next line
    this.resume();
  }

  /**
   * Step into function
   */
  stepInto(): void {
    // In a real implementation, this would step into a function call
    this.resume();
  }

  /**
   * Step out of function
   */
  stepOut(): void {
    // In a real implementation, this would step out of current function
    this.resume();
  }

  /**
   * Get current execution context
   */
  getExecutionContext(): ExecutionContext | null {
    return this.executionContext;
  }

  /**
   * Set pause callback
   */
  setPauseCallback(callback: () => void): void {
    this.pauseCallback = callback;
  }

  /**
   * Evaluate expression in current context
   */
  async evaluateExpression(expression: string): Promise<any> {
    // In a real implementation, this would evaluate the expression
    // in the current execution context
    return `Evaluated: ${expression}`;
  }
}

// Export singleton instance
export const debuggerService = new DebuggerService();
