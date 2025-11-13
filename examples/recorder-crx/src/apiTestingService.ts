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

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface ApiRequest {
  id: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

export interface ApiResponse {
  id: string;
  requestId: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body?: string;
  responseTime: number;
  timestamp: number;
}

export interface ApiAssertion {
  id: string;
  type: 'status' | 'header' | 'body' | 'json-path' | 'json-schema' | 'response-time';
  operator: 'equals' | 'contains' | 'matches' | 'less-than' | 'greater-than' | 'exists';
  expected: any;
  actual?: any;
  path?: string; // For JSON path assertions
  passed?: boolean;
  message?: string;
}

export interface ApiTestCase {
  id: string;
  name: string;
  description?: string;
  request: ApiRequest;
  assertions: ApiAssertion[];
  response?: ApiResponse;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiMock {
  id: string;
  name: string;
  pattern: string; // URL pattern to match
  method: HttpMethod;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
    delay?: number; // Delay in ms
  };
  enabled: boolean;
}

export interface ContractTest {
  id: string;
  name: string;
  provider: string; // API provider name
  consumer: string; // API consumer name
  endpoint: string;
  method: HttpMethod;
  requestSchema?: string; // JSON Schema
  responseSchema?: string; // JSON Schema
  examples: Array<{
    request: any;
    response: any;
  }>;
}

export interface PerformanceBenchmark {
  id: string;
  name: string;
  endpoint: string;
  method: HttpMethod;
  targetResponseTime: number; // in ms
  measurements: Array<{
    timestamp: Date;
    responseTime: number;
    success: boolean;
  }>;
  avgResponseTime?: number;
  minResponseTime?: number;
  maxResponseTime?: number;
  p50?: number;
  p95?: number;
  p99?: number;
}

export class ApiTestingService {
  private testCases: Map<string, ApiTestCase> = new Map();
  private mocks: Map<string, ApiMock> = new Map();
  private contracts: Map<string, ContractTest> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private capturedRequests: Map<string, { request: ApiRequest; response?: ApiResponse }> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load data from Chrome storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([
        'api_test_cases',
        'api_mocks',
        'api_contracts',
        'api_benchmarks'
      ]);

      if (result.api_test_cases) {
        this.testCases = new Map(Object.entries(result.api_test_cases));
      }
      if (result.api_mocks) {
        this.mocks = new Map(Object.entries(result.api_mocks));
      }
      if (result.api_contracts) {
        this.contracts = new Map(Object.entries(result.api_contracts));
      }
      if (result.api_benchmarks) {
        this.benchmarks = new Map(Object.entries(result.api_benchmarks));
      }
    } catch (error) {
      console.error('Error loading API testing data:', error);
    }
  }

  /**
   * Save data to Chrome storage
   */
  private async saveToStorage(): Promise<void> {
    try {
      await chrome.storage.local.set({
        api_test_cases: Object.fromEntries(this.testCases),
        api_mocks: Object.fromEntries(this.mocks),
        api_contracts: Object.fromEntries(this.contracts),
        api_benchmarks: Object.fromEntries(this.benchmarks)
      });
    } catch (error) {
      console.error('Error saving API testing data:', error);
    }
  }

  /**
   * Capture network request from Playwright
   */
  captureRequest(request: ApiRequest): void {
    this.capturedRequests.set(request.id, { request });
  }

  /**
   * Capture network response from Playwright
   */
  captureResponse(response: ApiResponse): void {
    const captured = this.capturedRequests.get(response.requestId);
    if (captured) {
      captured.response = response;
    }
  }

  /**
   * Get all captured requests
   */
  getCapturedRequests(): Array<{ request: ApiRequest; response?: ApiResponse }> {
    return Array.from(this.capturedRequests.values());
  }

  /**
   * Clear captured requests
   */
  clearCapturedRequests(): void {
    this.capturedRequests.clear();
  }

  /**
   * Create test case from captured request
   */
  createTestCaseFromRequest(requestId: string, name: string): ApiTestCase | null {
    const captured = this.capturedRequests.get(requestId);
    if (!captured) return null;

    const testCase: ApiTestCase = {
      id: `test-${Date.now()}`,
      name,
      request: captured.request,
      assertions: [],
      response: captured.response,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Auto-generate basic assertions if response exists
    if (captured.response) {
      testCase.assertions.push({
        id: `assert-${Date.now()}-1`,
        type: 'status',
        operator: 'equals',
        expected: captured.response.status,
        actual: captured.response.status,
        passed: true,
        message: `Status code should be ${captured.response.status}`
      });

      testCase.assertions.push({
        id: `assert-${Date.now()}-2`,
        type: 'response-time',
        operator: 'less-than',
        expected: 2000,
        actual: captured.response.responseTime,
        passed: captured.response.responseTime < 2000,
        message: 'Response time should be less than 2000ms'
      });
    }

    this.testCases.set(testCase.id, testCase);
    this.saveToStorage();
    return testCase;
  }

  /**
   * Add test case
   */
  addTestCase(testCase: ApiTestCase): void {
    this.testCases.set(testCase.id, testCase);
    this.saveToStorage();
  }

  /**
   * Update test case
   */
  updateTestCase(id: string, updates: Partial<ApiTestCase>): void {
    const testCase = this.testCases.get(id);
    if (testCase) {
      Object.assign(testCase, updates, { updatedAt: new Date() });
      this.saveToStorage();
    }
  }

  /**
   * Delete test case
   */
  deleteTestCase(id: string): void {
    this.testCases.delete(id);
    this.saveToStorage();
  }

  /**
   * Get all test cases
   */
  getTestCases(): ApiTestCase[] {
    return Array.from(this.testCases.values());
  }

  /**
   * Execute test case
   */
  async executeTestCase(id: string): Promise<ApiTestCase> {
    const testCase = this.testCases.get(id);
    if (!testCase) throw new Error('Test case not found');

    const startTime = Date.now();

    try {
      // Execute request
      const response = await fetch(testCase.request.url, {
        method: testCase.request.method,
        headers: testCase.request.headers,
        body: testCase.request.body
      });

      const responseTime = Date.now() - startTime;
      const responseBody = await response.text();

      const apiResponse: ApiResponse = {
        id: `resp-${Date.now()}`,
        requestId: testCase.request.id,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        responseTime,
        timestamp: Date.now()
      };

      testCase.response = apiResponse;

      // Execute assertions
      for (const assertion of testCase.assertions) {
        await this.executeAssertion(assertion, apiResponse, responseBody);
      }

      testCase.updatedAt = new Date();
      this.saveToStorage();

      return testCase;
    } catch (error) {
      throw new Error(`Test execution failed: ${error}`);
    }
  }

  /**
   * Execute assertion
   */
  private async executeAssertion(assertion: ApiAssertion, response: ApiResponse, responseBody: string): Promise<void> {
    let actual: any;
    let passed = false;

    switch (assertion.type) {
      case 'status':
        actual = response.status;
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;

      case 'header':
        actual = response.headers[assertion.path || ''];
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;

      case 'body':
        actual = responseBody;
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;

      case 'json-path':
        try {
          const json = JSON.parse(responseBody);
          actual = this.getJsonPath(json, assertion.path || '');
          passed = this.compare(actual, assertion.expected, assertion.operator);
        } catch (error) {
          passed = false;
          assertion.message = `JSON parse error: ${error}`;
        }
        break;

      case 'json-schema':
        try {
          const json = JSON.parse(responseBody);
          passed = await this.validateJsonSchema(json, assertion.expected);
        } catch (error) {
          passed = false;
          assertion.message = `Schema validation error: ${error}`;
        }
        break;

      case 'response-time':
        actual = response.responseTime;
        passed = this.compare(actual, assertion.expected, assertion.operator);
        break;
    }

    assertion.actual = actual;
    assertion.passed = passed;
  }

  /**
   * Compare values based on operator
   */
  private compare(actual: any, expected: any, operator: string): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'matches':
        return new RegExp(expected).test(String(actual));
      case 'less-than':
        return Number(actual) < Number(expected);
      case 'greater-than':
        return Number(actual) > Number(expected);
      case 'exists':
        return actual !== undefined && actual !== null;
      default:
        return false;
    }
  }

  /**
   * Get value from JSON using path
   */
  private getJsonPath(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === undefined || current === null) return undefined;
      current = current[key];
    }
    return current;
  }

  /**
   * Validate JSON against schema (basic implementation)
   */
  private async validateJsonSchema(data: any, schema: any): Promise<boolean> {
    // This is a simplified implementation
    // In production, use a library like ajv
    try {
      if (typeof schema === 'string') {
        schema = JSON.parse(schema);
      }
      // Basic type checking
      if (schema.type && typeof data !== schema.type) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Add API mock
   */
  addMock(mock: ApiMock): void {
    this.mocks.set(mock.id, mock);
    this.saveToStorage();
  }

  /**
   * Update mock
   */
  updateMock(id: string, updates: Partial<ApiMock>): void {
    const mock = this.mocks.get(id);
    if (mock) {
      Object.assign(mock, updates);
      this.saveToStorage();
    }
  }

  /**
   * Delete mock
   */
  deleteMock(id: string): void {
    this.mocks.delete(id);
    this.saveToStorage();
  }

  /**
   * Get all mocks
   */
  getMocks(): ApiMock[] {
    return Array.from(this.mocks.values());
  }

  /**
   * Get enabled mocks
   */
  getEnabledMocks(): ApiMock[] {
    return Array.from(this.mocks.values()).filter(m => m.enabled);
  }

  /**
   * Add contract test
   */
  addContract(contract: ContractTest): void {
    this.contracts.set(contract.id, contract);
    this.saveToStorage();
  }

  /**
   * Get all contracts
   */
  getContracts(): ContractTest[] {
    return Array.from(this.contracts.values());
  }

  /**
   * Add benchmark
   */
  addBenchmark(benchmark: PerformanceBenchmark): void {
    this.benchmarks.set(benchmark.id, benchmark);
    this.saveToStorage();
  }

  /**
   * Run benchmark
   */
  async runBenchmark(id: string, iterations: number = 10): Promise<PerformanceBenchmark> {
    const benchmark = this.benchmarks.get(id);
    if (!benchmark) throw new Error('Benchmark not found');

    benchmark.measurements = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        const response = await fetch(benchmark.endpoint, {
          method: benchmark.method
        });
        const responseTime = Date.now() - startTime;
        benchmark.measurements.push({
          timestamp: new Date(),
          responseTime,
          success: response.ok
        });
      } catch (error) {
        benchmark.measurements.push({
          timestamp: new Date(),
          responseTime: Date.now() - startTime,
          success: false
        });
      }
    }

    // Calculate statistics
    const times = benchmark.measurements.map(m => m.responseTime).sort((a, b) => a - b);
    benchmark.avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
    benchmark.minResponseTime = Math.min(...times);
    benchmark.maxResponseTime = Math.max(...times);
    benchmark.p50 = times[Math.floor(times.length * 0.5)];
    benchmark.p95 = times[Math.floor(times.length * 0.95)];
    benchmark.p99 = times[Math.floor(times.length * 0.99)];

    this.saveToStorage();
    return benchmark;
  }

  /**
   * Get all benchmarks
   */
  getBenchmarks(): PerformanceBenchmark[] {
    return Array.from(this.benchmarks.values());
  }

  /**
   * Generate code for API test
   */
  generateCode(testCase: ApiTestCase, language: string): string {
    switch (language) {
      case 'javascript':
      case 'playwright-test':
        return this.generatePlaywrightCode(testCase);
      case 'python':
      case 'python-pytest':
        return this.generatePythonCode(testCase);
      case 'java':
      case 'java-junit':
        return this.generateJavaCode(testCase);
      default:
        return this.generatePlaywrightCode(testCase);
    }
  }

  /**
   * Generate Playwright test code
   */
  private generatePlaywrightCode(testCase: ApiTestCase): string {
    let code = `import { test, expect } from '@playwright/test';\n\n`;
    code += `test('${testCase.name}', async ({ request }) => {\n`;
    code += `  const response = await request.${testCase.request.method.toLowerCase()}('${testCase.request.url}'`;

    if (testCase.request.body || Object.keys(testCase.request.headers).length > 0) {
      code += `, {\n`;
      if (Object.keys(testCase.request.headers).length > 0) {
        code += `    headers: ${JSON.stringify(testCase.request.headers, null, 2)},\n`;
      }
      if (testCase.request.body) {
        code += `    data: ${testCase.request.body},\n`;
      }
      code += `  }`;
    }

    code += `);\n\n`;

    // Add assertions
    for (const assertion of testCase.assertions) {
      switch (assertion.type) {
        case 'status':
          code += `  expect(response.status()).toBe(${assertion.expected});\n`;
          break;
        case 'header':
          code += `  expect(response.headers()['${assertion.path}']).toBe('${assertion.expected}');\n`;
          break;
        case 'json-path':
          code += `  const body = await response.json();\n`;
          code += `  expect(body.${assertion.path}).toBe(${JSON.stringify(assertion.expected)});\n`;
          break;
        case 'response-time':
          code += `  // Response time assertion - implement with custom logic\n`;
          break;
      }
    }

    code += `});\n`;
    return code;
  }

  /**
   * Generate Python test code
   */
  private generatePythonCode(testCase: ApiTestCase): string {
    let code = `import pytest\nfrom playwright.sync_api import sync_playwright\n\n`;
    code += `def test_${testCase.name.toLowerCase().replace(/\s+/g, '_')}():\n`;
    code += `    with sync_playwright() as p:\n`;
    code += `        browser = p.chromium.launch()\n`;
    code += `        context = browser.new_context()\n`;
    code += `        page = context.new_page()\n\n`;
    code += `        response = context.request.${testCase.request.method.toLowerCase()}("${testCase.request.url}")\n\n`;

    for (const assertion of testCase.assertions) {
      if (assertion.type === 'status') {
        code += `        assert response.status == ${assertion.expected}\n`;
      }
    }

    code += `        browser.close()\n`;
    return code;
  }

  /**
   * Generate Java test code
   */
  private generateJavaCode(testCase: ApiTestCase): string {
    let code = `import com.microsoft.playwright.*;\nimport org.junit.jupiter.api.*;\n\n`;
    code += `class ApiTest {\n`;
    code += `    @Test\n`;
    code += `    void ${testCase.name.replace(/\s+/g, '')}() {\n`;
    code += `        try (Playwright playwright = Playwright.create()) {\n`;
    code += `            APIRequestContext request = playwright.request().newContext();\n`;
    code += `            APIResponse response = request.${testCase.request.method.toLowerCase()}("${testCase.request.url}");\n\n`;

    for (const assertion of testCase.assertions) {
      if (assertion.type === 'status') {
        code += `            assertEquals(${assertion.expected}, response.status());\n`;
      }
    }

    code += `        }\n`;
    code += `    }\n`;
    code += `}\n`;
    return code;
  }
}

// Export singleton instance
export const apiTestingService = new ApiTestingService();
