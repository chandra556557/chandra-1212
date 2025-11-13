# 🚀 API Testing Suite - Quick Start Guide

Get started with API testing in under 5 minutes!

---

## ⚡ Quick Setup

### 1. Build the Extension

```bash
npm run build
```

### 2. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `examples/recorder-crx/dist` folder

### 3. Open the Extension

- Click the extension icon in your toolbar
- **OR** press `Alt + Shift + R`

### 4. Enable Experimental Features

1. Click the **Settings** (⚙️) button
2. Check **"Experimental Features"**
3. Click Save

---

## 🎯 Your First API Test in 3 Steps

### Step 1: Start Recording (30 seconds)

1. Click the **API** button (🔌) in the toolbar
2. Click **"Start Recording"** button
3. Navigate to any website (e.g., `https://jsonplaceholder.typicode.com/`)
4. Click around to trigger API calls
5. Click **"Stop Recording"**

**You should see**: Captured requests appear in the list!

### Step 2: Create a Test (30 seconds)

1. Select any captured request (e.g., `GET /posts`)
2. Click the **"+ Test"** button
3. Enter a name: `Get All Posts`
4. Click OK

**You should see**: Test case created with automatic assertions!

### Step 3: Run the Test (30 seconds)

1. Go to the **"Tests"** tab
2. Click **"▶️ Run"** on your test
3. Wait for execution

**You should see**:
- ✅ Green checkmarks for passed assertions
- Response status, time, and body

---

## 📚 What's Next?

### Try These Examples

#### Example 1: Test a Public API

```
1. Start Recording
2. Visit: https://api.github.com/users/octocat
3. Stop Recording
4. Create test: "Get GitHub User"
5. Run test
```

**Expected Results**:
- ✅ Status: 200
- ✅ Response time: < 2000ms

#### Example 2: Add Custom Assertions

```
1. Select your test case
2. Add assertion:
   - Type: json-path
   - Path: login
   - Operator: equals
   - Expected: octocat
3. Run test again
```

#### Example 3: Create a Performance Benchmark

```
1. Go to "Benchmark" tab
2. Click "+ New Benchmark"
3. Configure:
   - Name: GitHub API Performance
   - Endpoint: https://api.github.com/users/octocat
   - Method: GET
   - Target: 500ms
4. Click "Run"
5. View statistics (Avg, P95, P99)
```

#### Example 4: Create an API Mock

```
1. Go to "Mocks" tab
2. Click "+ New Mock"
3. Configure:
   - Name: Offline User Data
   - Pattern: */api/users/*
   - Method: GET
   - Status: 200
   - Body: {"name": "Test User", "id": 123}
4. Enable the mock
5. Test your app offline!
```

---

## 🎓 Key Features

### Request Recorder
- ✅ Captures HTTP/HTTPS requests
- ✅ Filters out static resources
- ✅ Shows request/response details

### Test Cases
- ✅ Auto-generated assertions
- ✅ Status, header, body validation
- ✅ JSON path queries
- ✅ Response time checks

### API Mocks
- ✅ Pattern-based matching
- ✅ Custom responses
- ✅ Configurable delays
- ✅ Easy enable/disable

### Benchmarks
- ✅ Performance testing
- ✅ Statistical analysis (P50, P95, P99)
- ✅ SLA monitoring
- ✅ Multiple iterations

---

## 💡 Pro Tips

### Tip 1: Filter Noise
The recorder automatically filters images, fonts, and CSS. If you still see too many requests, manually select only API endpoints you care about.

### Tip 2: Name Tests Clearly
Use descriptive names like:
- ✅ "Login with valid credentials"
- ✅ "Get user profile by ID"
- ❌ "Test 1"

### Tip 3: Use Multiple Assertions
Add 3-5 assertions per test:
- Status code
- Response time
- Critical JSON fields
- Headers (if needed)

### Tip 4: Organize Tests
Group related tests:
- Authentication tests
- User management tests
- Product catalog tests

### Tip 5: Run Benchmarks Regularly
Track performance trends over time to catch regressions early.

---

## 🐛 Troubleshooting

### No requests captured?

**Solution**:
1. Ensure recording is started
2. Check if the site makes API calls
3. Try refreshing the page
4. Check browser console for errors

### Test failing unexpectedly?

**Solution**:
1. Check if API response changed
2. Verify network connectivity
3. Review expected vs actual values
4. Re-record the request

### Mock not working?

**Solution**:
1. Ensure mock is enabled (toggle switch)
2. Check URL pattern matches exactly
3. Verify HTTP method matches
4. Test pattern with simpler URL first

---

## 📖 Learn More

- **Full User Guide**: [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
- **Technical Docs**: [API_TESTING_IMPLEMENTATION.md](./API_TESTING_IMPLEMENTATION.md)
- **Playwright Docs**: [API Testing](https://playwright.dev/docs/api-testing-js)

---

## 🎉 Success!

You're now ready to test APIs like a pro! 🚀

**Next Steps**:
1. Test your own application's APIs
2. Create a full test suite
3. Set up performance benchmarks
4. Share your tests with the team

---

**Questions?** Check the [full documentation](./API_TESTING_GUIDE.md) or open an issue on GitHub!

**Happy Testing! 🧪**
