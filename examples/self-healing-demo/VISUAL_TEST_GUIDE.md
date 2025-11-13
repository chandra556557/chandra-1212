# Self-Healing Visual Test Guide 📸

This guide shows you step-by-step how to test self-healing with screenshots.

## 🎯 Complete Test Flow

### Step 1: Open Extension
```
1. Click Playwright extension icon in Chrome toolbar
2. Login modal appears (if not logged in)
3. Enter credentials: demo@example.com / demo123
4. Click "Login"
```

**What You See:**
```
┌─────────────────────────────────────┐
│  Playwright Test Recorder          │
├─────────────────────────────────────┤
│  🔴 Record                          │
│  📋 Code Panel                      │
│  ⚙️  Settings                       │
│  🧪 Execute                         │
│  🔧 API                             │
│  💊 Heal                            │
└─────────────────────────────────────┘
```

---

### Step 2: Copy Demo Script
```
1. Open: examples/self-healing-demo/simple-demo.js
2. Select all (Ctrl+A)
3. Copy (Ctrl+C)
```

**Script Preview:**
```javascript
// Navigate to demo page
await page.goto('https://demo.playwright.dev/todomvc/');

// Test 1: Unstable ID (WILL FAIL)
try {
  await page.click('#new-todo-123456789');
  console.log('✅ Test 1 passed');
} catch (error) {
  console.log('❌ Test 1 failed - Self-healing should capture');
}
// ... more tests
```

---

### Step 3: Paste in Code Panel
```
1. Click "Code Panel" tab in extension
2. Clear existing code (if any)
3. Paste script (Ctrl+V)
4. Click "Save DB" button
5. Enter name: "Self-Healing Demo"
6. Click "Save"
```

**What You See:**
```
┌────────────────────────────────────────┐
│ Code Panel                             │
├────────────────────────────────────────┤
│ // Navigate to demo page              │
│ await page.goto('https://demo...');   │
│                                        │
│ // Test 1: Unstable ID                │
│ try {                                  │
│   await page.click('#new-todo-...');  │
│   ...                                  │
│                                        │
│ [Save DB] [Clear] [Format]           │
└────────────────────────────────────────┘
```

---

### Step 4: Open Test Executor
```
1. Click "Execute" button (🧪) in toolbar
2. Test Executor panel opens
```

**What You See:**
```
┌────────────────────────────────────────┐
│ Test Executor                          │
├────────────────────────────────────────┤
│ Select Script:                         │
│ [ Self-Healing Demo ▼ ]               │
│                                        │
│ [Script Library] [Run]                │
│                                        │
│ Status: Ready                          │
│ Logs:                                  │
│ ┌────────────────────────────────┐    │
│ │                                │    │
│ └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

**Console Shows:**
```
✅ Self-healing integration started
```

---

### Step 5: Run Test
```
1. Select "Self-Healing Demo" from dropdown
   OR
   Click "Script Library" → Select script → "Run Selected"
2. Click "Run" button
3. Wait for execution
```

**What You See:**
```
┌────────────────────────────────────────┐
│ Test Executor                          │
├────────────────────────────────────────┤
│ Status: Running ⏳                     │
│                                        │
│ Logs:                                  │
│ ┌────────────────────────────────┐    │
│ │ Test execution started         │    │
│ │ ❌ Test 1 failed               │    │
│ │ ❌ Test 2 failed               │    │
│ │ ❌ Test 3 failed               │    │
│ │ ✅ Test 4 passed               │    │
│ │ ❌ Test 5 failed               │    │
│ │ === Demo Complete ===          │    │
│ └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

**Browser Console (F12):**
```
Test execution started for script: abc123
❌ Test 1 failed (expected) - Self-healing should capture this
Expected healing: .new-todo or [data-testid="new-todo"]
❌ Test 2 failed (expected) - Self-healing should capture this
Expected healing: .new-todo or input.new-todo
❌ Test 3 failed (expected) - Self-healing should capture this
Expected healing: .new-todo
✅ Test 4 passed - This is the correct locator
Todo count: 1
❌ Test 5 failed (expected) - Self-healing should capture this
Expected healing: Look for button with stable attributes

=== Self-Healing Demo Complete ===
```

---

### Step 6: Open Self-Healing Panel
```
1. Click "Heal" button (💊) in toolbar
2. Self-Healing panel opens
3. Click "Refresh" if suggestions don't appear immediately
```

**What You See:**
```
┌─────────────────────────────────────────┐
│ Self-Healing Suggestions                │
├─────────────────────────────────────────┤
│ Statistics:                             │
│ • Total: 4                              │
│ • Pending: 4                            │
│ • Approved: 0                           │
│ • Rejected: 0                           │
│ • Avg Confidence: 76%                   │
│                                         │
│ [Refresh]                               │
├─────────────────────────────────────────┤
│ Pending (4)                             │
│                                         │
│ 1. ┌─────────────────────────────────┐ │
│    │ Broken: #new-todo-123456789     │ │
│    │ Valid:  .new-todo               │ │
│    │ Confidence: 85%                 │ │
│    │ [Approve] [Reject]              │ │
│    └─────────────────────────────────┘ │
│                                         │
│ 2. ┌─────────────────────────────────┐ │
│    │ Broken: .css-1x2y3z4-input      │ │
│    │ Valid:  input.new-todo          │ │
│    │ Confidence: 75%                 │ │
│    │ [Approve] [Reject]              │ │
│    └─────────────────────────────────┘ │
│                                         │
│ 3. ┌─────────────────────────────────┐ │
│    │ Broken: /html/body/div[1]...    │ │
│    │ Valid:  .new-todo               │ │
│    │ Confidence: 65%                 │ │
│    │ [Approve] [Reject]              │ │
│    └─────────────────────────────────┘ │
│                                         │
│ 4. ┌─────────────────────────────────┐ │
│    │ Broken: #button-timestamp-...   │ │
│    │ Valid:  button[type="submit"]   │ │
│    │ Confidence: 80%                 │ │
│    │ [Approve] [Reject]              │ │
│    └─────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### Step 7: Approve/Reject Suggestions
```
Option 1: Approve
1. Click "Approve" button on suggestion
2. Suggestion moves to "Approved" section
3. Confidence score increases

Option 2: Reject
1. Click "Reject" button on suggestion
2. Suggestion moves to "Rejected" section
```

**After Approving Suggestion #1:**
```
┌─────────────────────────────────────────┐
│ Self-Healing Suggestions                │
├─────────────────────────────────────────┤
│ Statistics:                             │
│ • Total: 4                              │
│ • Pending: 3                            │
│ • Approved: 1                           │
│ • Rejected: 0                           │
│ • Avg Confidence: 78%                   │
├─────────────────────────────────────────┤
│ Approved (1)                            │
│                                         │
│ 1. ┌─────────────────────────────────┐ │
│    │ Broken: #new-todo-123456789     │ │
│    │ Valid:  .new-todo               │ │
│    │ Confidence: 95% ⬆               │ │
│    │ ✅ Approved                     │ │
│    └─────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Pending (3)                             │
│ ... remaining suggestions ...           │
└─────────────────────────────────────────┘
```

---

### Step 8: Verify in Console
```
1. Press F12 to open DevTools
2. Go to Console tab
3. Run verification commands
```

**Console Commands:**
```javascript
// Check statistics
const stats = await selfHealingService.getStatistics();
console.table(stats);

// Expected output:
┌─────────────────────┬────────┐
│ total               │ 4      │
│ pending             │ 3      │
│ approved            │ 1      │
│ rejected            │ 0      │
│ averageConfidence   │ 0.78   │
└─────────────────────┴────────┘

// Check if listening
console.log('Listening:', realDataIntegration.isListening);
// Output: true

// Get healing history
const history = await realDataIntegration.getRealHealingHistory();
console.table(history);
```

---

## 🎬 Complete Test Sequence

### Visual Checklist:

#### Before Testing:
- [ ] Extension installed and reloaded
- [ ] Backend running (optional)
- [ ] Logged into extension
- [ ] Demo script ready

#### During Testing:
- [ ] Code pasted in extension ✓
- [ ] Script saved to DB ✓
- [ ] Test Executor opened ✓
- [ ] Console shows "integration started" ✓
- [ ] Test executed ✓
- [ ] Failures visible in logs ✓

#### After Testing:
- [ ] Heal panel shows suggestions ✓
- [ ] Suggestion count matches failures ✓
- [ ] Confidence scores displayed ✓
- [ ] Can approve suggestions ✓
- [ ] Can reject suggestions ✓
- [ ] Statistics update correctly ✓

---

## 📊 Expected Results Table

| Test | Broken Locator | Expected Healing | Confidence | Status |
|------|---------------|------------------|------------|--------|
| 1 | `#new-todo-123456789` | `.new-todo` | 85% | ✅ |
| 2 | `.css-1x2y3z4-input` | `input.new-todo` | 75% | ✅ |
| 3 | `/html/body/div[1]...` | `.new-todo` | 65% | ✅ |
| 4 | `.new-todo` | N/A (working) | N/A | ✅ Pass |
| 5 | `#button-timestamp-...` | `button[type="submit"]` | 80% | ✅ |

---

## 🔍 What Each Panel Shows

### 1. Code Panel
```
┌────────────────────────────────┐
│ Your test script               │
│ With intentional failures      │
│                                │
│ [Save DB] [Clear] [Format]    │
└────────────────────────────────┘
```

### 2. Test Executor Panel
```
┌────────────────────────────────┐
│ Script selection               │
│ Run controls                   │
│ Execution logs                 │
│ Status indicators              │
└────────────────────────────────┘
```

### 3. Self-Healing Panel
```
┌────────────────────────────────┐
│ Statistics summary             │
│ Pending suggestions            │
│ Approved suggestions           │
│ Rejected suggestions           │
│ Actions (Approve/Reject)       │
└────────────────────────────────┘
```

### 4. Console (F12)
```
┌────────────────────────────────┐
│ Integration status             │
│ Test execution logs            │
│ Healing events                 │
│ Debug information              │
│ Verification commands          │
└────────────────────────────────┘
```

---

## 🎨 UI States

### State 1: Before Test Run
```
Heal Panel: Empty or "No suggestions found"
Console: "✅ Self-healing integration started"
Executor: "Ready"
```

### State 2: During Test Run
```
Heal Panel: Still empty (suggestions not created yet)
Console: Test execution logs appearing
Executor: "Running ⏳"
```

### State 3: After Test Failure
```
Heal Panel: Suggestions appear (may need refresh)
Console: "❌ Test X failed - Self-healing should capture"
Executor: "Completed" or "Failed"
```

### State 4: After Approval
```
Heal Panel: Suggestion moved to "Approved" section
Console: Confidence increased
Statistics: Approved count ++
```

---

## 🐛 Troubleshooting Visuals

### Issue: No Suggestions Appear

**Check These Panels:**

1. **Console (F12):**
   ```
   ✓ "✅ Self-healing integration started"
   ✓ "Test execution started"
   ✓ "❌ Test X failed"
   ❌ No "Locator failed" messages → Integration issue
   ```

2. **Executor Panel:**
   ```
   ✓ Shows "Completed" or "Failed"
   ✓ Logs show failures
   ❌ No logs → Test didn't run
   ```

3. **Heal Panel:**
   ```
   ❌ "No suggestions found"
   → Click "Refresh"
   → Check console for errors
   ```

### Issue: Wrong Confidence Scores

**Verify:**
```javascript
// Console:
const suggestions = await selfHealingService.getSuggestions();
suggestions.forEach(s => {
  console.log(`${s.brokenLocator} → ${s.validLocator}: ${s.confidence}`);
});
```

**Expected Pattern:**
```
data-testid locators → 90-95%
id locators → 85-90%
aria-label → 80-85%
role → 75-80%
text → 60-70%
css class → 50-60%
xpath → 40-50%
```

---

## ✅ Success Indicators

### Visual Confirmation:

1. **Extension Icon**
   - Green badge when logged in
   - No error indicators

2. **Test Executor**
   - Status: "Completed"
   - Logs show test results
   - No red error messages

3. **Self-Healing Panel**
   - Shows 4+ suggestions
   - Confidence scores visible
   - Can interact with buttons

4. **Console**
   - "✅ Self-healing integration started"
   - Failure logs appear
   - No red errors

5. **Statistics**
   ```
   Total: 4+
   Pending: 4 (before approval)
   Average Confidence: 70-85%
   ```

---

## 🎓 Learning Outcomes

After completing this test, you should be able to:

✅ Copy and paste test scripts into extension
✅ Execute tests via Test Executor
✅ Identify failed locators in logs
✅ View self-healing suggestions
✅ Approve/reject suggestions
✅ Monitor healing statistics
✅ Verify integration via console
✅ Troubleshoot common issues

---

## 📸 Screenshot Checklist

Take screenshots of:

- [ ] Extension main panel
- [ ] Code panel with demo script
- [ ] Test Executor during run
- [ ] Console with failure logs
- [ ] Heal panel with suggestions
- [ ] Approved suggestion
- [ ] Statistics panel
- [ ] Console verification commands

---

**Ready to Test!** Follow this guide step-by-step and screenshot your results! 🚀
