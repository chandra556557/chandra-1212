# 🔍 How the Execute Button Works - Complete Flow

## 📊 Overview

The Execute button has **TWO execution modes**:

1. **Execute Current Script** - Runs the currently recorded script (in-memory)
2. **Execute Saved Script** - Runs a script from the database

---

## 🎯 Execution Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER CLICKS                              │
│                                                                 │
│  Option 1: "Execute Current Script" button                     │
│  Option 2: Select saved script → "Run Selected" button         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                   WHERE IT PICKS THE SCRIPT                     │
│                                                                 │
│  OPTION 1: Current Script (from recorder)                      │
│  ├─ Source: In-memory recording                                │
│  ├─ Location: crxRecorder.tsx → sources → text                 │
│  └─ Script ID: "current" or language name                      │
│                                                                 │
│  OPTION 2: Saved Script (from database)                        │
│  ├─ Source: PostgreSQL database                                │
│  ├─ Location: Script table via API                             │
│  └─ Script ID: UUID from database                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTION PROCESS                            │
│                                                                 │
│  1. testExecutor.executeTest(scriptId)                         │
│     └─ Creates TestRun object with ID                          │
│                                                                 │
│  2. apiService.connectWebSocket()                              │
│     └─ Establishes WebSocket connection to backend             │
│                                                                 │
│  3. apiService.sendMessage('executeTest', { scriptId })        │
│     └─ Sends execution request to backend                      │
│                                                                 │
│  4. Backend receives message via WebSocket                      │
│     └─ Retrieves script code from database                     │
│     └─ Creates TestRun record (status: 'queued')               │
│                                                                 │
│  5. Backend sends progress updates                              │
│     └─ testRunProgress (step updates)                          │
│     └─ testRunLog (execution logs)                             │
│     └─ testRunComplete (final result)                          │
│                                                                 │
│  6. Frontend displays progress                                  │
│     └─ Updates UI with status, logs, results                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Detailed Code Flow

### **1. Execute Current Script Button**

**File:** `testExecutorUI.tsx`

```typescript
// When user clicks "Execute Current Script"
const handleExecute = async () => {
  // scriptId comes from props (current language ID)
  const testRun = await testExecutor.executeTest(scriptId);

  // Set up progress tracking
  testExecutor.addProgressCallback(testRun.id, progress => {
    setProgress(progress);
  });

  // Set up log tracking
  testExecutor.addLogCallback(testRun.id, log => {
    setLogs(prev => [...prev, log]);
  });
}
```

**Where does `scriptId` come from?**
- Passed as prop to `TestExecutorPanel`
- Usually the current language name: `"playwright-test"`, `"java-junit"`, etc.

---

### **2. Execute Saved Script Button**

**File:** `testExecutorUI.tsx`

```typescript
// When user clicks "Run Selected"
const handleExecuteSavedScript = async () => {
  if (!selectedScript) return;

  // scriptId comes from selected script (database)
  const testRun = await testExecutor.executeTest(selectedScript.id);

  // Same progress/log tracking as above
}
```

**Where does `selectedScript` come from?**
```typescript
// User clicks "Script Library" button
const loadSavedScripts = async () => {
  const scripts = await apiService.getScripts(); // GET /api/scripts
  setSavedScripts(scripts);
}

// User clicks on a script in the modal
const handleScriptSelect = (script: Script) => {
  setSelectedScript(script); // Script from database
}
```

---

## 🗄️ Script Sources - Where Code Comes From

### **Option 1: Current Recording (In-Memory)**

```
Extension Recording
      ↓
crxRecorder.tsx
      ↓
sources[] array (from background.ts)
      ↓
source.text = "import { test, expect }..."
      ↓
Executed via scriptId = "playwright-test"
```

**Code Location:**
```typescript
// crxRecorder.tsx
const source = sources.find(s => s.id === selectedFileId);
// source.text contains the generated code
```

---

### **Option 2: Saved Script (Database)**

```
User saves script
      ↓
apiService.createScript(name, code, language)
      ↓
POST /api/scripts
      ↓
Stored in PostgreSQL (Script table)
      ↓
Loaded via apiService.getScripts()
      ↓
GET /api/scripts
      ↓
Displayed in Script Library
      ↓
Executed via script.id (UUID)
```

**Database Schema:**
```sql
Script {
  id: UUID (e.g., "a1b2c3d4-...")
  name: "Login Test"
  code: "import { test }..."
  language: "playwright-test"
  userId: UUID
  createdAt: DateTime
}
```

---

## 🔄 Complete Execution Flow (Step-by-Step)

### **Frontend (Extension)**

**Step 1: User Action**
```
testExecutorUI.tsx:
  handleExecute() or handleExecuteSavedScript()
    ↓
  testExecutor.executeTest(scriptId)
```

**Step 2: Create Test Run**
```typescript
// testExecutor.ts
const testRun: TestRun = {
  id: "abc123xyz", // Random ID
  scriptId: scriptId, // "current" or UUID
  status: 'pending',
  startTime: new Date(),
  logs: []
};
```

**Step 3: Send to Backend**
```typescript
// testExecutor.ts
apiService.connectWebSocket();
apiService.sendMessage('executeTest', {
  testRunId: testRun.id,
  scriptId: scriptId
});
```

---

### **Backend (Node.js)**

**Step 4: Receive WebSocket Message**
```javascript
// WebSocket handler (not shown in files, but conceptual)
socket.on('message', async (message) => {
  if (message.type === 'executeTest') {
    const { testRunId, scriptId } = message.data;

    // Retrieve script from database
    const script = await prisma.script.findUnique({
      where: { id: scriptId }
    });

    // Create test run record
    const testRun = await prisma.testRun.create({
      data: {
        scriptId: script.id,
        userId: user.id,
        status: 'queued',
        environment: 'development',
        browser: 'chromium'
      }
    });

    // Execute the script (actual Playwright execution)
    // This would run script.code in a Playwright process
    executePlaywrightScript(script.code);

    // Send progress updates back to extension
    socket.send({
      type: 'testRunProgress',
      data: { testRunId, progress: {...} }
    });
  }
});
```

**Step 5: Database Operations**
```typescript
// testRun.controller.ts - startTestRun()
const testRun = await prisma.testRun.create({
  data: {
    scriptId: scriptId,      // Where to find the code
    userId: userId,          // Who is running it
    status: 'queued',        // Initial status
    environment: 'development',
    browser: 'chromium'
  },
  include: {
    script: true             // Includes script.code!
  }
});
```

---

### **Frontend Response**

**Step 6: Receive Updates**
```typescript
// testExecutor.ts
apiService.addMessageHandler('testRunProgress', (data) => {
  this.handleTestRunProgress(data);
  // Updates UI progress bar, status
});

apiService.addMessageHandler('testRunLog', (data) => {
  this.handleTestRunLog(data);
  // Displays execution logs
});

apiService.addMessageHandler('testRunComplete', (data) => {
  this.handleTestRunComplete(data);
  // Shows final result (passed/failed)
});
```

---

## 🎬 Example Scenarios

### **Scenario 1: Execute Current Recording**

```
1. User records test in browser
   → Code generates: "test('should login', async () => {...})"

2. User clicks "Execute Current Script"
   → scriptId = "playwright-test"
   → Script code = current recording text

3. Backend receives:
   {
     testRunId: "xyz789",
     scriptId: "playwright-test"
   }

4. Backend looks up:
   - If scriptId is language name → uses in-memory code
   - Creates TestRun with status 'queued'

5. Execution happens → sends updates → UI shows progress
```

---

### **Scenario 2: Execute Saved Script**

```
1. User previously saved script:
   - Name: "Login Test"
   - ID: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
   - Code: "test('login', async () => {...})"

2. User opens Script Library
   → Calls apiService.getScripts()
   → Displays saved scripts

3. User selects "Login Test"
   → selectedScript.id = "a1b2c3d4-..."

4. User clicks "Run Selected"
   → scriptId = "a1b2c3d4-..."

5. Backend receives:
   {
     testRunId: "xyz789",
     scriptId: "a1b2c3d4-..."
   }

6. Backend queries database:
   SELECT * FROM Script WHERE id = "a1b2c3d4-..."
   → Returns: { code: "test('login'...)" }

7. Execution runs the database code → updates sent → UI displays
```

---

## 📊 Data Flow Summary

```
┌──────────────────────────────────────────────────────────────┐
│  SCRIPT SOURCE                                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Current Recording          Saved Script                    │
│       ↓                          ↓                           │
│  In-Memory Code            Database Record                  │
│  (sources[].text)          (Script.code)                    │
│       ↓                          ↓                           │
│  scriptId = language       scriptId = UUID                  │
│       ↓                          ↓                           │
│  ┌────────────────────────────────┐                         │
│  │   testExecutor.executeTest()   │                         │
│  └────────────────────────────────┘                         │
│                ↓                                             │
│  ┌────────────────────────────────┐                         │
│  │    WebSocket to Backend        │                         │
│  └────────────────────────────────┘                         │
│                ↓                                             │
│  ┌────────────────────────────────┐                         │
│  │  Backend Retrieves Code        │                         │
│  │  - From memory or database     │                         │
│  └────────────────────────────────┘                         │
│                ↓                                             │
│  ┌────────────────────────────────┐                         │
│  │  Creates TestRun Record        │                         │
│  │  status: 'queued' → 'running'  │                         │
│  └────────────────────────────────┘                         │
│                ↓                                             │
│  ┌────────────────────────────────┐                         │
│  │  Executes Playwright Script    │                         │
│  └────────────────────────────────┘                         │
│                ↓                                             │
│  ┌────────────────────────────────┐                         │
│  │  Sends Progress Updates        │                         │
│  │  - Logs                        │                         │
│  │  - Status                      │                         │
│  │  - Final result                │                         │
│  └────────────────────────────────┘                         │
│                ↓                                             │
│  ┌────────────────────────────────┐                         │
│  │  UI Displays Execution         │                         │
│  └────────────────────────────────┘                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Points

1. **Two Script Sources:**
   - **Current Recording**: In-memory, from recorder
   - **Saved Scripts**: Database, via API

2. **Script Identification:**
   - Current: `scriptId = "playwright-test"` (language name)
   - Saved: `scriptId = "a1b2c3d4-..."` (UUID from database)

3. **Backend Retrieval:**
   - Looks up `scriptId` in Script table
   - Executes the `code` field
   - Creates TestRun record for tracking

4. **Real-time Updates:**
   - WebSocket connection
   - Progress, logs, and completion messages
   - UI updates in real-time

5. **Database Storage:**
   - Scripts saved via "Save DB" button
   - Retrieved via "Script Library" modal
   - Executed via "Run Selected" button

---

## ✅ Summary

**Execute Button picks test scripts from:**

1. **In-Memory** (Current Recording)
   - Generated during browser recording
   - Stored in `sources[]` array
   - Accessed via language ID

2. **Database** (Saved Scripts)
   - Previously saved via "Save DB"
   - Stored in PostgreSQL Script table
   - Retrieved via API `/api/scripts`
   - Selected from Script Library modal

**Both paths** converge at `testExecutor.executeTest(scriptId)` which sends the script ID to the backend for execution!
