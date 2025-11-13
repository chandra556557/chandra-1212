# Enhanced Features Integration Guide

## 🎉 What's New

The Playwright-CRX recorder extension now includes **4 powerful enhanced features** fully integrated into the UI:

### 1. ✨ **Self-Healing Locators**
- Automatically suggests alternative locators when selectors break
- Approve/reject healing suggestions
- Persistent storage of approved locators
- Intelligent fallback strategies (ID → TestID → CSS → XPath → Name)

### 2. 📊 **Data-Driven Testing (DDT)**
- Upload CSV/JSON files with test data
- Variable substitution using `${variableName}` syntax
- Run same test with multiple data sets
- Manage multiple data files

### 3. 🐛 **Advanced Debugger**
- Set breakpoints in test scripts
- Step-by-step execution (Step Over, Step Into, Step Out)
- Inspect variables at runtime
- Evaluate expressions during execution

### 4. ⚡ **Test Executor**
- Execute tests with real-time progress
- Data-driven test execution
- Execution history and logs
- WebSocket-based remote execution support

---

## 🎯 How to Access Features

When you open the recorder extension with **experimental features enabled**, you'll see new toolbar buttons:

### Toolbar Buttons (Left to Right):
1. **Save** - Save recorded code to file
2. **Execute** - Open Test Executor panel
3. **Debug** - Open Debugger panel
4. **Heal** - Open Self-Healing Suggestions panel
5. **Data** - Open Data-Driven Testing manager
6. **Tools** - Additional tools menu
7. **Settings** - Preferences

---

## 📖 Usage Instructions

### Self-Healing Locators

1. Click the **"Heal"** (sparkle icon) button
2. A panel opens on the right side showing:
   - **Pending Suggestions** - New healing suggestions to review
   - **Approved Suggestions** - Previously approved locators
   - **Rejected Suggestions** - Rejected suggestions
3. For each suggestion:
   - Review the broken vs. valid locator
   - Check the confidence score
   - Click **Approve** to use the new locator
   - Click **Reject** to dismiss

**When to use:**
- When your recorded tests fail due to changed element selectors
- To maintain test stability across UI updates

---

### Data-Driven Testing

1. Click the **"Data"** (database icon) button
2. Upload a CSV or JSON file with test data:

**CSV Example:**
```csv
username,password,expected
user1,pass123,Success
user2,pass456,Success
```

**JSON Example:**
```json
[
  {"username": "user1", "password": "pass123", "expected": "Success"},
  {"username": "user2", "password": "pass456", "expected": "Success"}
]
```

3. In your test script, use variables:
```typescript
await page.fill('#username', '${username}');
await page.fill('#password', '${password}');
await expect(page.locator('.message')).toHaveText('${expected}');
```

4. The test will run once for each row of data

**When to use:**
- Testing with multiple user credentials
- Form validation with different inputs
- Any scenario requiring parameter variation

---

### Debugger

1. Click the **"Debug"** (bug icon) button
2. The debugger panel opens at the bottom
3. Set breakpoints by clicking line numbers in the code editor
4. Run your test - execution will pause at breakpoints
5. When paused, you can:
   - View current variable values
   - Evaluate custom expressions
   - Step Over (F10) - execute current line
   - Step Into (F11) - step into function calls
   - Step Out (Shift+F11) - complete current function
   - Resume (F8) - continue execution

**When to use:**
- Troubleshooting failing tests
- Understanding test execution flow
- Inspecting element states at specific points

---

### Test Executor

1. Click the **"Execute"** (console icon) button
2. The executor panel opens on the right
3. Two execution modes:

**Standard Execution:**
- Click **"Execute Test"** to run the current script
- View real-time progress and logs

**Data-Driven Execution:**
- Select a data file from the dropdown
- Click **"Execute with Data"**
- Test runs once per data row
- View aggregated results

4. Monitor:
   - Execution status (Running/Passed/Failed)
   - Real-time logs
   - Execution history

**When to use:**
- Running tests without leaving the recorder
- Quick validation of recorded scripts
- Batch testing with multiple data sets

---

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────┐
│ [Save] [Execute] [Debug] [Heal] [Data] ... [⚙️]    │  ← Toolbar
├─────────────────────────────────┬───────────────────┤
│                                 │                   │
│                                 │  Self-Healing     │
│   Code Editor                   │  or               │
│   (Recorder)                    │  DDT Manager      │
│                                 │  or               │
│                                 │  Test Executor    │
│                                 │                   │
├─────────────────────────────────┴───────────────────┤
│  Debugger Panel (when active)                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Enable Experimental Features

1. Click the **Settings** (gear icon) button
2. Check **"Experimental Features"** (if not already enabled)
3. Configure:
   - Default language for code generation
   - Test ID attribute name
   - Side panel preferences

---

## 💡 Tips & Best Practices

### Self-Healing
- Regularly review and approve suggestions to build a robust healing database
- High confidence scores (>80%) are usually safe to approve
- Test approved healings to ensure they work correctly

### Data-Driven Testing
- Keep data files organized with descriptive names
- Use column names that match your test variables
- Start with small data sets for testing

### Debugger
- Set breakpoints before critical assertions
- Use expression evaluation to test selectors before adding them
- Step through flaky tests to identify timing issues

### Test Executor
- Review logs after failed executions for debugging
- Use data-driven execution for regression testing
- Check execution history to track test stability

---

## 🚀 Next Steps

1. **Build the extension:**
   ```bash
   npm run build:examples:recorder
   ```

2. **Load in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `examples/recorder-crx/dist`

3. **Start using:**
   - Click the extension icon to open recorder
   - Enable experimental features in settings
   - Explore the new toolbar buttons!

---

## 📝 Technical Details

### Architecture
- **Services:** Backend logic (`*Service.ts` files)
- **UI Components:** React components (`*UI.tsx` files)
- **Integration:** Connected via [`crxRecorder.tsx`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/crxRecorder.tsx)

### Storage
- Uses Chrome's `chrome.storage.local` API
- Persistent across sessions
- Per-script data isolation

### Files Modified
- [`crxRecorder.tsx`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/crxRecorder.tsx) - Main UI integration
- [`selfHealingUI.tsx`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/selfHealingUI.tsx) - Added close button
- [`debuggerUI.tsx`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/debuggerUI.tsx) - Added close button
- [`testExecutorUI.tsx`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/testExecutorUI.tsx) - Added close button
- [`crxRecorder.css`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/crxRecorder.css) - Enhanced styling

---

## 🎯 Summary

You now have a **professional-grade testing extension** with:
✅ Self-healing locators for test stability
✅ Data-driven testing for parameterization
✅ Advanced debugging for troubleshooting
✅ Integrated test execution with real-time feedback

All features are **fully functional** and ready to use! 🎉
