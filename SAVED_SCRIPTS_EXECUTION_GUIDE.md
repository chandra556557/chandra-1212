# 📚 Saved Scripts Execution Guide

## 🎯 Overview

The **Test Executor** now supports executing **saved scripts from the cloud**! This allows you to:
- Browse scripts saved via the API service
- Execute any saved script with one click
- Run saved scripts with data-driven testing
- Track execution history across all scripts

---

## ✨ New Features

### 1. **Script Library Browser** 📚
- View all your saved scripts in a modal dialog
- See script metadata (name, language, description, creation date)
- Filter and select scripts to execute
- Quick refresh to load latest scripts

### 2. **One-Click Execution** ▶️
- Select a script from the library
- Execute it immediately
- View real-time execution progress
- Access execution logs and history

### 3. **Dual Execution Modes** 🔀
- **Saved Script Mode**: Execute scripts from the cloud
- **Current Script Mode**: Execute the currently recorded script
- Switch between modes seamlessly

---

## 🚀 How to Use

### **Step 1: Save Scripts to Cloud** (Prerequisites)

First, you need to save scripts using the API service:

```typescript
// 1. Login or register
await apiService.login('your-email@example.com', 'password');

// 2. Save your recorded script
const script = await apiService.createScript(
  'Login Test',                    // name
  'await page.goto("...")...',     // code
  'playwright-test',               // language
  'Tests user login flow'          // description (optional)
);
```

Or use the UI (if you've integrated the API UI components).

---

### **Step 2: Open Test Executor**

1. Click the **"Execute" (▶️)** button in the recorder toolbar
2. The Test Executor panel opens on the right side

---

### **Step 3: Browse Script Library**

1. Click the **"📚 Script Library (X)"** button
   - The number shows how many scripts you have saved
2. A modal opens showing all your saved scripts
3. Each script displays:
   - **Name** - Script title
   - **Language** - Programming language
   - **Description** - What the script does
   - **Created Date** - When it was saved
   - **Project** - Associated project (if any)

---

### **Step 4: Select a Script**

1. Click on any script in the list
2. The script highlights and gets selected
3. The modal closes automatically
4. Selected script info appears in the executor panel:
   ```
   ✅ Login Test (playwright-test)
   ```

---

### **Step 5: Execute the Script**

1. Click **"▶️ Run Selected"**
2. Watch real-time execution:
   - **Status**: Starting → Running → Completed/Failed
   - **Progress messages**
   - **Live logs**
3. View results in the execution history

---

## 🎨 UI Layout

```
┌────────────────────────────────────────┐
│  Test Execution                  [×]   │
├────────────────────────────────────────┤
│                                        │
│  📚 Script Library (5)                 │  ← Click to browse
│  ┌────────────────────────────────┐   │
│  │ ✅ Login Test (playwright-test) │   │  ← Selected script
│  │           [▶️ Run Selected]     │   │  ← Execute button
│  └────────────────────────────────┘   │
│                                        │
│              OR                        │  ← Divider
│                                        │
│  [▶️ Execute Current Script]           │  ← Run recorder script
│                                        │
│  [▼] Select data file for DDT          │
│  [▶️ Execute with Data]                │
│                                        │
│  ──────────────────────────────────   │
│  Status: completed ✅                  │
│  Message: Test completed successfully  │
│                                        │
│  📄 Execution Logs:                    │
│  ┌────────────────────────────────┐   │
│  │ Starting test execution...      │   │
│  │ Navigating to page...           │   │
│  │ Test passed ✅                  │   │
│  └────────────────────────────────┘   │
│                                        │
│  📊 Execution History:                 │
│  • #a1b2c3 passed 10:23 AM            │
│  • #d4e5f6 failed 10:20 AM            │
└────────────────────────────────────────┘
```

---

## 📋 Script Library Modal

When you click "📚 Script Library":

```
┌──────────────────────────────────────────┐
│  Saved Scripts                      [×]  │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 📝 Login Test                      │ │
│  │ Language: playwright-test          │ │
│  │ Tests user login flow              │ │
│  │ Created: 2025-01-15 | Project: QA │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │ ← Selected (highlighted)
│  │ 🛒 Checkout Flow                   │ │
│  │ Language: javascript               │ │
│  │ E2E checkout process               │ │
│  │ Created: 2025-01-14                │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🔍 Search Functionality            │ │
│  │ Language: python-pytest            │ │
│  │ Tests search with various inputs   │ │
│  │ Created: 2025-01-13                │ │
│  └────────────────────────────────────┘ │
│                                          │
├──────────────────────────────────────────┤
│                     [🔄 Refresh]         │
└──────────────────────────────────────────┘
```

---

## 🔐 Authentication Setup

To use saved scripts, you need to be authenticated:

### **Option 1: Programmatic Login**
```typescript
import { apiService } from './apiService';

// Login
await apiService.login('user@example.com', 'password');

// Or register
await apiService.register('user@example.com', 'password', 'Your Name');
```

### **Option 2: UI Login** (if implemented)
- Use the authentication UI component
- Enter credentials
- Token is automatically stored

### **Token Persistence**
- Authentication tokens are stored in `chrome.storage.local`
- Tokens persist across browser sessions
- Auto-loaded when Test Executor opens

---

## 💡 Use Cases

### **1. Regression Testing**
```
Save common test scenarios →
Execute periodically →
Catch regressions early
```

### **2. Multi-Environment Testing**
```
Save script once →
Execute on dev/staging/prod →
Compare results
```

### **3. Team Collaboration**
```
Team member saves script →
You load and execute →
Shared test library
```

### **4. Data-Driven Execution**
```
Select saved script →
Choose data file →
Execute with multiple data sets
```

---

## ⚙️ Features Breakdown

### **Script Library Button**
- Shows count of available scripts: `📚 Script Library (5)`
- Disabled during execution
- Opens modal on click

### **Selected Script Info**
- Displays: `✅ [Script Name] ([Language])`
- Stays visible after selection
- Clear visual confirmation

### **Execution Modes**

| Mode | When to Use | Button |
|------|-------------|--------|
| **Saved Script** | Execute cloud-saved tests | ▶️ Run Selected |
| **Current Script** | Execute recorder script | ▶️ Execute Current Script |
| **Data-Driven** | Run with CSV/JSON data | ▶️ Execute with Data |

---

## 🔧 Technical Details

### **Data Flow**
```
1. User clicks "Script Library"
2. TestExecutorUI calls apiService.getScripts()
3. API fetches scripts from backend
4. Scripts displayed in modal
5. User selects script
6. Script ID passed to testExecutor.executeTest()
7. Execution starts via WebSocket
8. Real-time progress updates
9. Results displayed
```

### **State Management**
```typescript
const [savedScripts, setSavedScripts] = useState<Script[]>([]);
const [selectedScript, setSelectedScript] = useState<Script | null>(null);
const [showScriptLibrary, setShowScriptLibrary] = useState<boolean>(false);
```

### **API Integration**
- Uses existing [`apiService`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/apiService.ts)
- Leverages authentication tokens
- WebSocket for real-time updates

---

## 🚨 Error Handling

### **Not Authenticated**
```
Error: Failed to load saved scripts.
Please ensure you are logged in.
```
**Solution**: Login using `apiService.login()`

### **No Scripts Found**
```
No saved scripts found.
Save your recorded scripts using the API service.
```
**Solution**: Save scripts first using `apiService.createScript()`

### **Network Error**
```
Error loading saved scripts: Network request failed
```
**Solution**: Check backend API is running

---

## 🎯 Best Practices

### **1. Organize Scripts**
- Use descriptive names
- Add clear descriptions
- Group by project
- Tag with metadata

### **2. Version Control**
- Update scripts when UI changes
- Keep old versions for comparison
- Document breaking changes

### **3. Execution Strategy**
- Test scripts locally first
- Use data-driven for variations
- Monitor execution history
- Review failed runs

### **4. Performance**
- Refresh script list periodically
- Don't keep modal open during execution
- Clear old execution logs

---

## 🔄 Workflow Example

### **Complete End-to-End Workflow**

```typescript
// 1. Record a test in Playwright Recorder
// (User interacts with UI)

// 2. Save the recorded script
const code = recordedScript; // From recorder
await apiService.login('dev@company.com', 'password');
await apiService.createScript(
  'Product Search Test',
  code,
  'playwright-test',
  'Verifies search functionality'
);

// 3. Later: Execute the saved script
// - Open Test Executor
// - Click "📚 Script Library"
// - Select "Product Search Test"
// - Click "▶️ Run Selected"
// - Watch execution
// - Review results

// 4. Execute with data (optional)
// - Upload CSV with search terms
// - Select data file
// - Click "Execute with Data"
// - Test runs once per row
```

---

## 📊 Comparison: Before vs After

### **Before** ❌
- Could only execute current recorder script
- No way to browse saved scripts
- Manual copy-paste required
- No script library

### **After** ✅
- Browse all saved scripts
- One-click execution
- Cloud-based script storage
- Execution history tracking
- Data-driven support for saved scripts

---

## 🎉 Summary

You can now:
✅ **Browse** all your saved scripts in a beautiful UI
✅ **Select** any script with one click
✅ **Execute** saved scripts instantly
✅ **Track** execution history
✅ **Combine** with data-driven testing
✅ **Share** scripts via cloud API

This transforms the Test Executor into a **complete test management system**! 🚀

---

## 📝 Next Steps

1. **Try it out:**
   - Save a script using the API
   - Open Test Executor
   - Browse and execute

2. **Explore advanced features:**
   - Data-driven execution
   - Multi-environment testing
   - Team collaboration

3. **Provide feedback:**
   - Report issues
   - Suggest improvements
   - Share use cases

Happy Testing! 🎭
