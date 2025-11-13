# Self-Healing Troubleshooting Guide

## No Suggestions Appearing in Heal Panel

If you ran the script but see no suggestions, follow these steps:

---

## Quick Diagnostic Checklist

### ✅ Step 1: Check Extension Console

1. **Open DevTools on Extension Popup**
   ```
   - Click extension icon (to open popup)
   - Press F12 (opens DevTools)
   - Go to Console tab
   ```

2. **Look for This Message:**
   ```
   ✅ Self-healing integration started
   ```
   
   - **If you see it**: Integration is working ✓
   - **If you DON'T see it**: Integration not started ❌

### ✅ Step 2: Verify Test Executor Was Open

**CRITICAL:** The Test Executor panel must be open when running the test!

```
Self-healing ONLY works when:
1. Test Executor panel is open
2. Test runs through Test Executor
3. Integration starts automatically
```

**Fix:**
```
1. Click "Execute" button (🧪) in toolbar
2. Console should show: "✅ Self-healing integration started"
3. NOW run your test
4. Check Heal panel after test completes
```

### ✅ Step 3: Check How You Ran the Script

**❌ WRONG WAY (Won't capture failures):**
```
- Pasting in browser console
- Running via external Playwright CLI
- Running in DevTools
```

**✅ CORRECT WAY (Will capture failures):**
```
1. Open Playwright extension
2. Click "Execute" button
3. Select script OR use "Script Library"
4. Click "Run" button
5. Wait for completion
6. Click "Heal" button
```

### ✅ Step 4: Verify Tests Actually Failed

1. **Check Test Executor Logs:**
   ```
   Should see error messages like:
   "Error: locator: ..."
   "Element not found"
   "Timeout waiting for selector"
   ```

2. **If No Errors Shown:**
   - Tests didn't fail (locators might exist on page)
   - Try different demo script
   - Use script with guaranteed failures

---

## Common Issues & Fixes

### Issue #1: "Test Executor wasn't open"

**Symptom:**
- Script ran but no integration message
- No suggestions appear
- Console is clean

**Fix:**
```
1. Open Test Executor: Click "Execute" (🧪)
2. Verify console: "✅ Self-healing integration started"
3. Run test again
4. Check Heal panel
```

### Issue #2: "Script ran outside extension"

**Symptom:**
- Script executed somewhere else
- No connection to extension

**Fix:**
```
1. Close any external Playwright runners
2. Use ONLY the extension Test Executor
3. Paste script in Code Panel
4. Click "Save DB"
5. Run via "Execute" → "Run"
```

### Issue #3: "Tests didn't actually fail"

**Symptom:**
- Tests passed
- No error messages
- Status shows "Passed"

**Fix:**
Use this guaranteed-to-fail script:
```javascript
await page.goto('https://demo.playwright.dev/todomvc/');

// This WILL fail (non-existent ID)
await page.click('#this-id-does-not-exist-12345');

console.log('If you see this, something is wrong!');
```

### Issue #4: "Heal panel not refreshed"

**Symptom:**
- Tests failed
- Integration working
- But Heal panel empty

**Fix:**
```
1. Click "Heal" button (💊)
2. Click "Refresh" button
3. Wait 2-3 seconds
4. Suggestions should appear
```

### Issue #5: "Extension not reloaded after build"

**Symptom:**
- Code changes not taking effect
- Old behavior persists

**Fix:**
```
1. Go to chrome://extensions/
2. Find "Playwright CRX"
3. Click reload button (circular arrow)
4. Close and reopen extension
5. Try again
```

---

## Diagnostic Script

### Run This in Extension Console (F12)

```javascript
// === SELF-HEALING DIAGNOSTIC ===
console.log('🔍 Running Self-Healing Diagnostics...\n');

// 1. Check if integration is loaded
console.log('1. Check Integration Module:');
if (typeof realDataIntegration !== 'undefined') {
  console.log('  ✅ realDataIntegration loaded');
  console.log('  Listening:', realDataIntegration.isListening);
  console.log('  Active executions:', realDataIntegration.activeExecutions?.size || 0);
} else {
  console.log('  ❌ realDataIntegration NOT loaded');
}

// 2. Check if service is loaded
console.log('\n2. Check Self-Healing Service:');
if (typeof selfHealingService !== 'undefined') {
  console.log('  ✅ selfHealingService loaded');
} else {
  console.log('  ❌ selfHealingService NOT loaded');
}

// 3. Check for existing suggestions
console.log('\n3. Check Existing Suggestions:');
selfHealingService.getSuggestions().then(suggestions => {
  console.log('  Total suggestions:', suggestions.length);
  if (suggestions.length > 0) {
    console.log('  Suggestions found:');
    suggestions.forEach((s, i) => {
      console.log(`    ${i+1}. ${s.brokenLocator} → ${s.validLocator} (${Math.round(s.confidence*100)}%)`);
    });
  } else {
    console.log('  ⚠️  No suggestions in storage');
  }
});

// 4. Check statistics
console.log('\n4. Check Statistics:');
selfHealingService.getStatistics().then(stats => {
  console.table(stats);
});

// 5. Check Chrome storage directly
console.log('\n5. Check Chrome Storage:');
chrome.storage.local.get(null, (data) => {
  const healingKeys = Object.keys(data).filter(k => k.includes('healing'));
  console.log('  Healing-related keys:', healingKeys.length);
  healingKeys.forEach(key => {
    console.log(`    - ${key}`);
  });
});

// 6. Test event system
console.log('\n6. Test Event System:');
console.log('  Adding test event listener...');
window.addEventListener('locatorFailed', (e) => {
  console.log('  ✅ Event received:', e.detail);
}, { once: true });

// Dispatch test event
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('locatorFailed', {
    detail: {
      testId: 'diagnostic-test',
      locator: '#test-locator-123',
      error: 'Test error for diagnostics'
    }
  }));
  console.log('  Test event dispatched');
}, 1000);

console.log('\n✅ Diagnostics complete. Check results above.');
```

---

## Manual Test (Guaranteed to Work)

If automatic capture isn't working, create a suggestion manually:

```javascript
// In extension console (F12):
console.log('Creating manual suggestion...');

await selfHealingService.recordFailure(
  {
    locator: '#broken-button-12345',
    type: 'id',
    confidence: 0.3
  },
  {
    locator: '[data-testid="submit-button"]',
    type: 'testid',
    confidence: 0.95
  }
);

console.log('✅ Manual suggestion created!');
console.log('Now open Heal panel and click Refresh');

// Verify it was saved
const suggestions = await selfHealingService.getSuggestions();
console.log('Total suggestions:', suggestions.length);
```

**Then:**
1. Click "Heal" button
2. Click "Refresh"
3. You should see 1 suggestion!

---

## Step-by-Step Working Example

### Guaranteed Working Process:

**1. Reload Extension First**
```
chrome://extensions/ → Playwright CRX → Reload
```

**2. Open Extension and Login**
```
Click extension icon
Login: demo@example.com / demo123
```

**3. Open Test Executor FIRST**
```
Click "Execute" button (🧪)
VERIFY console shows: "✅ Self-healing integration started"
```

**4. Paste This Guaranteed-Fail Script**
```javascript
await page.goto('https://demo.playwright.dev/todomvc/');

// Guaranteed failure - ID doesn't exist
try {
  await page.click('#absolutely-does-not-exist-999999');
} catch (error) {
  console.log('❌ Test failed as expected!');
  console.log('Error:', error.message);
}

console.log('Test complete - check Heal panel!');
```

**5. Save and Run**
```
Click "Save DB" → Name: "Fail Test"
Click "Execute" → "Run"
Wait for completion
```

**6. Check Heal Panel**
```
Click "Heal" button (💊)
Click "Refresh"
Should see suggestion!
```

---

## Console Log Checklist

### What You SHOULD See:

```
✅ Self-healing integration started
Test execution started for script: ...
❌ Test failed as expected!
Error: locator: "#absolutely-does-not-exist-999999" ...
Test complete - check Heal panel!
```

### What Indicates a Problem:

```
❌ No "integration started" message → Test Executor not opened
❌ No test execution logs → Script didn't run via executor
❌ No error messages → Test didn't fail
❌ "realDataIntegration is not defined" → Extension needs reload
```

---

## Advanced Debugging

### Check Event Listeners

```javascript
// See what event listeners are registered
console.log('Checking event listeners...');

// Test if events are being captured
let eventReceived = false;

window.addEventListener('locatorFailed', (e) => {
  console.log('✅ locatorFailed event received!', e.detail);
  eventReceived = true;
});

// Manually trigger
window.dispatchEvent(new CustomEvent('locatorFailed', {
  detail: {
    testId: 'test-123',
    locator: '#test',
    error: 'test error'
  }
}));

setTimeout(() => {
  console.log('Event system working:', eventReceived);
}, 500);
```

### Check Integration State

```javascript
// Detailed integration check
if (typeof realDataIntegration !== 'undefined') {
  console.log('Integration State:', {
    isListening: realDataIntegration.isListening,
    activeExecutions: Array.from(realDataIntegration.activeExecutions?.keys() || []),
    hasEventListeners: true // If realDataIntegration exists
  });
  
  // Get real statistics
  realDataIntegration.getRealHealingStatistics().then(stats => {
    console.log('Real Healing Stats:', stats);
  });
} else {
  console.log('❌ Integration not loaded - extension needs reload');
}
```

---

## Quick Fixes

### Fix #1: Integration Not Starting
```
Solution: Always open Test Executor BEFORE running tests
1. Click "Execute" button
2. Verify "integration started" in console
3. Then run test
```

### Fix #2: No Failures Captured
```
Solution: Use script with guaranteed failures
Replace with: await page.click('#does-not-exist-12345');
```

### Fix #3: Heal Panel Empty
```
Solution: Manual refresh
1. Click "Heal" button
2. Click "Refresh" button
3. Wait 2-3 seconds
```

### Fix #4: Extension Not Updated
```
Solution: Full reload
1. chrome://extensions/
2. Remove extension
3. Rebuild: npm run build
4. Re-add: Load unpacked → dist folder
```

---

## Expected Behavior Summary

### ✅ When Working Correctly:

1. **Test Executor Opens:**
   - Console: "✅ Self-healing integration started"

2. **Test Runs:**
   - Console: "Test execution started for script: ..."
   - Console: Error messages for failures

3. **Test Fails:**
   - Console: "❌ Test failed as expected!"
   - Console: Full error with locator info

4. **Heal Panel:**
   - Shows suggestions (may need refresh)
   - Can approve/reject
   - Statistics update

### ❌ When NOT Working:

1. **No integration message** → Executor not opened
2. **No test logs** → Didn't run via executor
3. **No errors** → Test didn't fail
4. **No suggestions** → Events not captured

---

## Contact / Report Issue

If none of these fixes work, provide these details:

```
1. Console output (full log)
2. How you ran the script (exact steps)
3. Test Executor status (open/closed)
4. Any error messages
5. Chrome version
6. Extension version
```

Run diagnostic script and share output:
```javascript
// Copy diagnostic script from above
// Paste in console
// Share the output
```

---

## Success Indicator

You'll know it's working when you see:

✅ Console: "✅ Self-healing integration started"
✅ Test fails with error message
✅ Heal panel shows suggestions
✅ Can approve/reject suggestions
✅ Statistics show total > 0

**Still stuck?** Try the manual suggestion creation above to verify the UI works, then troubleshoot the integration separately.
