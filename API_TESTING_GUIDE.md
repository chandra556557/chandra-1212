# 🔌 API Testing Suite - User Guide

**Version**: 1.0.0
**Date**: 2025-10-23

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Getting Started](#getting-started)
4. [API Request Recorder](#api-request-recorder)
5. [API Test Cases](#api-test-cases)
6. [API Mocks & Stubs](#api-mocks--stubs)
7. [Performance Benchmarking](#performance-benchmarking)
8. [Contract Testing](#contract-testing)
9. [Code Generation](#code-generation)
10. [Best Practices](#best-practices)
11. [Examples](#examples)

---

## 🎯 Overview

The API Testing Suite is an advanced feature of the Playwright-CRX extension that enables comprehensive API testing capabilities directly from your browser. It captures, validates, mocks, and benchmarks REST/GraphQL API requests alongside your UI testing workflow.

### Key Benefits

✅ **Record & Replay** - Capture real API traffic and convert to test cases
✅ **Assertions** - Validate status codes, headers, body content, and response times
✅ **Mocking** - Stub API responses for offline testing
✅ **Performance** - Benchmark API response times and track degradation
✅ **Contract Testing** - Validate API contracts between services
✅ **Multi-Language** - Generate tests in TypeScript, Python, Java, and more

---

## 🚀 Features

### 1. **REST/GraphQL API Recorder**
- Automatically captures HTTP/HTTPS requests
- Records request/response pairs with full details
- Filters out static resources (images, fonts, etc.)
- Real-time request monitoring

### 2. **Request/Response Validation**
- **Status Code Assertions** - Verify HTTP status codes
- **Header Assertions** - Validate response headers
- **Body Assertions** - Check response body content
- **JSON Path Assertions** - Query JSON responses
- **JSON Schema Validation** - Validate against schemas
- **Response Time Assertions** - Ensure performance SLAs

### 3. **API Mocking & Stubbing**
- URL pattern matching
- Custom response status, headers, and body
- Configurable response delays
- Enable/disable mocks on-demand

### 4. **Performance Benchmarking**
- Run multiple iterations
- Calculate P50, P95, P99 percentiles
- Track min/max/avg response times
- Compare against target thresholds

### 5. **Contract Testing**
- Define API contracts
- Validate request/response schemas
- Provider/consumer testing
- Example-based validation

---

## 🏁 Getting Started

### Enable API Testing

1. **Open the Recorder Extension**
   - Click the extension icon or press `Alt+Shift+R`

2. **Enable Experimental Features**
   - Click Settings (⚙️) button
   - Check "Experimental Features"

3. **Open API Testing Panel**
   - Click the **API** button in the toolbar
   - The API Testing Suite panel opens on the right side

---

## 📡 API Request Recorder

### Start Recording

1. Click **"Start Recording"** button
2. Navigate to your application
3. Interact with features that make API calls
4. Captured requests appear in real-time

### Stop Recording

1. Click **"Stop Recording"** button
2. Review captured requests in the list

### View Request Details

1. Click on any captured request
2. Inspect:
   - Request method, URL, headers, body
   - Response status, headers, body
   - Response time

### Create Test from Request

1. Click **"+ Test"** button on a captured request
2. Enter test case name
3. Test case is created with auto-generated assertions

---

## ✅ API Test Cases

### Create Test Case

**From Captured Request:**
```
1. Record API traffic
2. Select a request
3. Click "+ Test" button
4. Name your test
```

**Manual Creation:**
```
1. Go to "Tests" tab
2. Click "+ New Test"
3. Configure request details
4. Add assertions
```

### Auto-Generated Assertions

When creating from a captured request, these assertions are added automatically:

- ✅ Status code matches captured response
- ✅ Response time is less than 2000ms

### Add Custom Assertions

**Status Code Assertion:**
```typescript
Type: status
Operator: equals
Expected: 200
```

**Header Assertion:**
```typescript
Type: header
Path: content-type
Operator: contains
Expected: application/json
```

**JSON Path Assertion:**
```typescript
Type: json-path
Path: data.user.name
Operator: equals
Expected: "John Doe"
```

**Response Time Assertion:**
```typescript
Type: response-time
Operator: less-than
Expected: 1000
```

### Execute Test

1. Select a test case
2. Click **"▶️ Run"** button
3. View results:
   - ✅ Green checkmark = Passed
   - ❌ Red X = Failed
   - Expected vs Actual values shown

### Delete Test

1. Select a test case
2. Click **"🗑️"** button
3. Confirm deletion

---

## 🎭 API Mocks & Stubs

### Create Mock

1. Go to **"Mocks"** tab
2. Click **"+ New Mock"**
3. Configure:
   - **Name**: Descriptive name
   - **Method**: GET, POST, PUT, etc.
   - **URL Pattern**: Pattern to match (e.g., `*/api/users/*`)
   - **Response Status**: HTTP status code
   - **Response Headers**: Custom headers
   - **Response Body**: JSON or text
   - **Delay**: Optional response delay (ms)

### Enable/Disable Mock

1. Toggle the switch on any mock
2. Enabled mocks intercept matching requests
3. Disabled mocks are inactive

### Use Cases

**Offline Testing:**
```json
{
  "pattern": "*/api/data",
  "response": {
    "status": 200,
    "body": "{\"data\": \"cached\"}"
  }
}
```

**Error Simulation:**
```json
{
  "pattern": "*/api/payment",
  "response": {
    "status": 500,
    "body": "{\"error\": \"Server Error\"}"
  }
}
```

**Slow Network Testing:**
```json
{
  "pattern": "*/api/search",
  "response": {
    "status": 200,
    "delay": 5000,
    "body": "{\"results\": []}"
  }
}
```

---

## ⚡ Performance Benchmarking

### Create Benchmark

1. Go to **"Benchmark"** tab
2. Click **"+ New Benchmark"**
3. Configure:
   - **Name**: Benchmark name
   - **Endpoint**: Full URL
   - **Method**: HTTP method
   - **Target Response Time**: SLA threshold (ms)

### Run Benchmark

1. Select a benchmark
2. Click **"▶️ Run"**
3. Executes 10 iterations by default
4. View statistics:
   - **Avg**: Average response time
   - **P50**: 50th percentile
   - **P95**: 95th percentile
   - **P99**: 99th percentile
   - **Min**: Minimum time
   - **Max**: Maximum time

### Interpret Results

- **Green** values: Within target threshold ✅
- **Red** values: Exceeds target threshold ❌

### Example

```
Endpoint: https://api.example.com/users
Method: GET
Target: 500ms

Results:
  Avg: 342ms ✅
  P50: 320ms
  P95: 450ms
  P99: 480ms
  Min: 280ms
  Max: 490ms
```

---

## 📋 Contract Testing

### Overview

Contract testing ensures API compatibility between:
- **Provider**: API service
- **Consumer**: Client application

### Create Contract (Coming Soon)

1. Go to **"Contracts"** tab
2. Click **"+ New Contract"**
3. Define:
   - Provider/Consumer names
   - Endpoint and method
   - Request schema
   - Response schema
   - Example requests/responses

### Validate Contract

1. Run contract tests
2. Verify schemas match actual traffic
3. Detect breaking changes early

---

## 💻 Code Generation

### Generate Test Code

The API Testing Suite can generate runnable test code in multiple languages:

### Supported Languages

- ✅ **JavaScript** / **TypeScript** (Playwright Test)
- ✅ **Python** (Playwright + Pytest)
- ✅ **Java** (Playwright + JUnit)
- ✅ **C#** (Playwright)

### Example Generated Code

**TypeScript (Playwright Test):**
```typescript
import { test, expect } from '@playwright/test';

test('Get user by ID', async ({ request }) => {
  const response = await request.get('https://api.example.com/users/123', {
    headers: {
      'Authorization': 'Bearer token123'
    }
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.name).toBe('John Doe');
});
```

**Python (Playwright + Pytest):**
```python
import pytest
from playwright.sync_api import sync_playwright

def test_get_user_by_id():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        response = context.request.get("https://api.example.com/users/123")

        assert response.status == 200
        browser.close()
```

**Java (JUnit):**
```java
import com.microsoft.playwright.*;
import org.junit.jupiter.api.*;

class ApiTest {
    @Test
    void getUserById() {
        try (Playwright playwright = Playwright.create()) {
            APIRequestContext request = playwright.request().newContext();
            APIResponse response = request.get("https://api.example.com/users/123");

            assertEquals(200, response.status());
        }
    }
}
```

### Copy Generated Code

1. Select a test case
2. Click **"Generate Code"** (if available)
3. Choose language
4. Copy to clipboard
5. Paste into your test suite

---

## 🎯 Best Practices

### Recording Best Practices

✅ **Start Fresh** - Clear captured requests before each recording session
✅ **Focus on APIs** - Filter captures to relevant API endpoints
✅ **Meaningful Names** - Use descriptive test case names
✅ **Incremental Testing** - Create tests for one feature at a time

### Assertion Best Practices

✅ **Multiple Assertions** - Validate status, headers, and body
✅ **Specific Checks** - Use JSON path for nested data
✅ **Performance SLAs** - Always include response time assertions
✅ **Error Cases** - Test both success and error responses

### Mocking Best Practices

✅ **Realistic Data** - Use production-like mock responses
✅ **Version Control** - Store mocks in version control
✅ **Clear Naming** - Name mocks descriptively
✅ **Disable When Done** - Turn off mocks after testing

### Benchmarking Best Practices

✅ **Consistent Environment** - Run in similar network conditions
✅ **Multiple Iterations** - Use at least 10 iterations
✅ **Warm-up Requests** - Discard first few requests
✅ **Track Trends** - Monitor performance over time

---

## 📚 Examples

### Example 1: REST API Test

**Scenario:** Test user login API

```typescript
Request:
  POST https://api.example.com/auth/login
  Headers:
    Content-Type: application/json
  Body:
    { "email": "user@test.com", "password": "pass123" }

Assertions:
  ✅ Status code equals 200
  ✅ Response body contains "token"
  ✅ Response time less than 1000ms
```

### Example 2: GraphQL API Test

**Scenario:** Query user data

```typescript
Request:
  POST https://api.example.com/graphql
  Headers:
    Content-Type: application/json
  Body:
    { "query": "{ user(id: \"123\") { name email } }" }

Assertions:
  ✅ Status code equals 200
  ✅ JSON path "data.user.name" exists
  ✅ JSON path "data.user.email" contains "@"
```

### Example 3: API Mock

**Scenario:** Mock external payment API

```json
{
  "name": "Payment API Mock",
  "method": "POST",
  "pattern": "*/api/payment/process",
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"transactionId\": \"mock-12345\", \"status\": \"success\"}",
    "delay": 500
  },
  "enabled": true
}
```

### Example 4: Performance Benchmark

**Scenario:** Monitor search API performance

```typescript
Benchmark Configuration:
  Name: Search API Performance
  Endpoint: https://api.example.com/search?q=test
  Method: GET
  Target: 300ms

Results:
  Avg: 245ms ✅
  P95: 280ms ✅
  P99: 295ms ✅
  Max: 298ms ✅
```

---

## 🔧 Troubleshooting

### Requests Not Being Captured

**Solution:**
- Ensure recording is started
- Check browser console for errors
- Verify extension permissions
- Reload the page and try again

### Assertions Failing

**Solution:**
- Check actual vs expected values
- Verify API response hasn't changed
- Update assertions if API contract changed
- Check network connectivity

### Mocks Not Working

**Solution:**
- Ensure mock is enabled
- Check URL pattern matches exactly
- Verify mock method matches request
- Check mock priority/order

### Slow Performance

**Solution:**
- Reduce number of assertions
- Disable unnecessary mocks
- Clear old test runs from storage
- Close unused browser tabs

---

## 🚀 Advanced Features

### Chaining API Tests

Run multiple tests in sequence:

```typescript
1. Login (get auth token)
2. Create resource (use token)
3. Verify resource (use token)
4. Delete resource (use token)
5. Logout
```

### Data-Driven API Testing

Combine with DDT feature:

```csv
username,password,expected_status
user1,pass1,200
user2,wrong,401
user3,pass3,200
```

### CI/CD Integration

Export tests to run in CI pipeline:

```bash
# Generated test file
npx playwright test api-tests.spec.ts
```

---

## 📊 Metrics & Reporting

### Test Execution Metrics

- Total tests: 25
- Passed: 22 ✅
- Failed: 3 ❌
- Success rate: 88%

### Performance Metrics

- Average response time: 245ms
- P95 response time: 450ms
- Fastest endpoint: /health (50ms)
- Slowest endpoint: /search (890ms)

---

## 🎓 Learning Resources

### Tutorials

1. [Introduction to API Testing](https://playwright.dev/docs/api-testing-js)
2. [REST API Best Practices](https://restfulapi.net/)
3. [GraphQL Testing Guide](https://graphql.org/learn/best-practices/)

### Documentation

- [Playwright API Testing](https://playwright.dev/docs/api/class-apirequestcontext)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [JSON Schema](https://json-schema.org/)

---

## 🤝 Contributing

Found a bug or have a feature request?

- [Report Issues](https://github.com/ruifigueira/playwright-crx/issues)
- [Submit Pull Requests](https://github.com/ruifigueira/playwright-crx/pulls)

---

## 📝 Summary

The API Testing Suite provides comprehensive API testing capabilities:

✅ **Record** real API traffic
✅ **Validate** responses with assertions
✅ **Mock** APIs for offline testing
✅ **Benchmark** performance metrics
✅ **Test** contracts between services
✅ **Generate** code in multiple languages

Start testing your APIs alongside your UI tests for complete end-to-end coverage! 🚀

---

**Version**: 1.0.0
**Last Updated**: 2025-10-23
**Status**: Production Ready ✅
