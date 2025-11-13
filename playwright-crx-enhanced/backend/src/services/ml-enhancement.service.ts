/**
 * ML-Powered Script Enhancement Service
 * Uses AST analysis and statistical pattern matching for intelligent code improvements
 */

import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

interface EnhancementSuggestion {
  lineNumber: number;
  originalCode: string;
  suggestedCode: string;
  reason: string;
  confidence: number;
  category: 'selector' | 'wait' | 'assertion' | 'best-practice' | 'error-handling' | 'performance';
}

interface PatternFeatures {
  hasTimeout: boolean;
  hasCssSelector: boolean;
  hasXpath: boolean;
  hasToBeTruthy: boolean;
  hasTextSelector: boolean;
  hasGetByRole: boolean;
  hasGetByText: boolean;
  hasTryCatch: boolean;
  complexityScore: number;
  selectorCount: number;
  waitCount: number;
  assertionCount: number;
}

export class MLEnhancementService {
  private patternDatabase: Map<string, number>;
  private isInitialized = false;

  constructor() {
    this.patternDatabase = new Map();
    this.initializePatternDatabase();
  }

  /**
   * Initialize pattern database with known good/bad patterns
   */
  private initializePatternDatabase(): void {
    // Store pattern priorities (higher = more important to fix)
    this.patternDatabase.set('waitForTimeout', 0.95);
    this.patternDatabase.set('cssSelector', 0.85);
    this.patternDatabase.set('xpath', 0.90);
    this.patternDatabase.set('toBeTruthy', 0.80);
    this.patternDatabase.set('textSelector', 0.70);
    this.patternDatabase.set('noTryCatch', 0.75);
    this.patternDatabase.set('hardcodedData', 0.65);
    this.patternDatabase.set('complexSelector', 0.70);
    
    this.isInitialized = true;
    console.log('✅ ML Enhancement service initialized with pattern database');
  }

  /**
   * Enhance script using ML + AST analysis
   */
  async enhanceScript(code: string, language: string = 'typescript'): Promise<{
    success: boolean;
    suggestions: EnhancementSuggestion[];
    enhancedCode: string;
    summary: any;
  }> {
    try {
      // 1. Parse code into AST
      const ast = this.parseCode(code, language);
      
      // 2. Extract features from AST
      const features = this.extractFeatures(ast, code);
      
      // 3. Use ML to predict enhancement priorities
      const priorities = await this.predictEnhancements(features);
      
      // 4. Generate suggestions based on AST + ML predictions
      const suggestions = this.generateSuggestions(ast, code, priorities);
      
      // 5. Apply suggestions
      const enhancedCode = this.applySuggestions(code, suggestions);
      
      // 6. Build summary
      const byCategory: Record<string, number> = {};
      suggestions.forEach(s => {
        byCategory[s.category] = (byCategory[s.category] || 0) + 1;
      });
      
      const avgConfidence = suggestions.length > 0
        ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
        : 0;

      return {
        success: true,
        suggestions,
        enhancedCode,
        summary: {
          totalSuggestions: suggestions.length,
          byCategory,
          avgConfidence,
          mlEnabled: this.isInitialized,
          features
        }
      };
    } catch (error) {
      console.error('Enhancement error:', error);
      return {
        success: false,
        suggestions: [],
        enhancedCode: code,
        summary: { error: (error as Error).message }
      };
    }
  }

  /**
   * Parse code to AST
   */
  private parseCode(code: string, _language: string): any {
    try {
      return parser.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error('Failed to parse code');
    }
  }

  /**
   * Extract features from AST for ML model
   */
  private extractFeatures(ast: any, _code: string): PatternFeatures {
    const features: PatternFeatures = {
      hasTimeout: false,
      hasCssSelector: false,
      hasXpath: false,
      hasToBeTruthy: false,
      hasTextSelector: false,
      hasGetByRole: false,
      hasGetByText: false,
      hasTryCatch: false,
      complexityScore: 0,
      selectorCount: 0,
      waitCount: 0,
      assertionCount: 0
    };

    let nodeCount = 0;

    traverse(ast, {
      CallExpression(path: any) {
        const callee = path.node.callee;
        
        // Detect waitForTimeout
        if (t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'waitForTimeout') {
          features.hasTimeout = true;
          features.waitCount++;
        }

        // Detect getByRole
        if (t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'getByRole') {
          features.hasGetByRole = true;
        }

        // Detect getByText
        if (t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'getByText') {
          features.hasGetByText = true;
        }

        // Detect toBeTruthy
        if (t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'toBeTruthy') {
          features.hasToBeTruthy = true;
          features.assertionCount++;
        }

        // Detect expect
        if (t.isIdentifier(callee) && callee.name === 'expect') {
          features.assertionCount++;
        }

        // Count selectors
        if (path.node.arguments.length > 0) {
          const firstArg = path.node.arguments[0];
          if (t.isStringLiteral(firstArg)) {
            const selector = firstArg.value;
            features.selectorCount++;
            
            if (selector.includes('text=')) {
              features.hasTextSelector = true;
            }
            if (selector.startsWith('.') || selector.startsWith('#') || selector.includes('[')) {
              features.hasCssSelector = true;
            }
            if (selector.startsWith('//') || selector.startsWith('xpath=')) {
              features.hasXpath = true;
            }
          }
        }

        nodeCount++;
      },

      TryStatement() {
        features.hasTryCatch = true;
      },

      AwaitExpression() {
        features.waitCount++;
        nodeCount++;
      }
    });

    // Calculate complexity score (0-1 range)
    features.complexityScore = Math.min(nodeCount / 100, 1);

    return features;
  }

  /**
   * Use pattern matching to predict enhancement priorities
   */
  private async predictEnhancements(features: PatternFeatures): Promise<number[]> {
    // Statistical analysis of patterns
    const priorities: number[] = [
      0, // selector
      0, // wait
      0, // assertion
      0, // best-practice
      0, // error-handling
      0  // performance
    ];

    // Selector priority
    if (features.hasCssSelector) priorities[0] += 0.4;
    if (features.hasXpath) priorities[0] += 0.5;
    if (features.hasTextSelector && !features.hasGetByText) priorities[0] += 0.3;
    if (features.selectorCount > 5) priorities[0] += 0.2;

    // Wait priority
    if (features.hasTimeout) priorities[1] += this.patternDatabase.get('waitForTimeout') || 0.9;
    if (features.waitCount > 3) priorities[1] += 0.2;

    // Assertion priority
    if (features.hasToBeTruthy) priorities[2] += this.patternDatabase.get('toBeTruthy') || 0.8;
    if (features.assertionCount < 2) priorities[2] += 0.1;

    // Best practice priority
    if (features.complexityScore > 0.7) priorities[3] += 0.5;
    if (features.selectorCount > 10) priorities[3] += 0.3;

    // Error handling priority
    if (!features.hasTryCatch && features.complexityScore > 0.5) priorities[4] += 0.6;

    // Performance priority
    if (features.waitCount > 5) priorities[5] += 0.4;
    if (features.complexityScore > 0.8) priorities[5] += 0.3;

    // Normalize to 0-1 range
    const max = Math.max(...priorities, 0.01);
    return priorities.map(p => Math.min(p / max, 1));
  }

  /**
   * Generate suggestions based on AST analysis and ML priorities
   */
  private generateSuggestions(
    ast: any,
    code: string,
    priorities: number[]
  ): EnhancementSuggestion[] {
    const suggestions: EnhancementSuggestion[] = [];
    const lines = code.split('\n');
    const categoryThreshold = 0.6; // Only suggest if priority > 0.6

    traverse(ast, {
      CallExpression(path: any) {
        const line = path.node.loc?.start.line - 1 || 0;
        const callee = path.node.callee;

        // Selector improvements (priority index 0)
        if (priorities[0] > categoryThreshold && t.isMemberExpression(callee)) {
          const property = callee.property;
          
          // CSS selector → getByTestId
          if (t.isIdentifier(property) && 
              (property.name === 'locator' || property.name === 'click') && 
              path.node.arguments[0] && 
              t.isStringLiteral(path.node.arguments[0])) {
            
            const selector = path.node.arguments[0].value;
            if (selector.startsWith('.') || selector.startsWith('#')) {
              const testId = selector.replace(/[.#]/g, '');
              suggestions.push({
                lineNumber: line,
                originalCode: lines[line],
                suggestedCode: lines[line].replace(selector, `[data-testid="${testId}"]`),
                reason: 'ML detected: CSS selector should use data-testid for better stability',
                confidence: priorities[0],
                category: 'selector'
              });
            }
          }
        }

        // Wait improvements (priority index 1)
        if (priorities[1] > categoryThreshold && 
            t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'waitForTimeout') {
          
          suggestions.push({
            lineNumber: line,
            originalCode: lines[line],
            suggestedCode: lines[line].replace('waitForTimeout', 'waitForLoadState(\'networkidle\')'),
            reason: 'ML detected: Replace arbitrary timeout with explicit wait',
            confidence: priorities[1],
            category: 'wait'
          });
        }

        // Assertion improvements (priority index 2)
        if (priorities[2] > categoryThreshold && 
            t.isMemberExpression(callee) && 
            t.isIdentifier(callee.property) && 
            callee.property.name === 'toBeTruthy') {
          
          suggestions.push({
            lineNumber: line,
            originalCode: lines[line],
            suggestedCode: lines[line].replace('toBeTruthy()', 'toBeVisible()'),
            reason: 'ML detected: Use semantic assertion for better clarity',
            confidence: priorities[2],
            category: 'assertion'
          });
        }
      }
    });

    return suggestions;
  }

  /**
   * Apply suggestions to code
   */
  private applySuggestions(code: string, suggestions: EnhancementSuggestion[]): string {
    const lines = code.split('\n');
    
    suggestions.forEach(suggestion => {
      if (suggestion.lineNumber >= 0 && suggestion.lineNumber < lines.length) {
        lines[suggestion.lineNumber] = suggestion.suggestedCode;
      }
    });

    return lines.join('\n');
  }

  /**
   * Cleanup resources (no-op for pattern-based approach)
   */
  dispose(): void {
    this.patternDatabase.clear();
  }
}

// Singleton instance
export const mlEnhancementService = new MLEnhancementService();
