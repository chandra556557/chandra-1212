# API Recording Diagnostic Tool

## Run This in Extension Background Console

### Step 1: Open Background Console
```
1. Go to chrome://extensions/
2. Find "Playwright CRX"
3. Click "background page" (under Inspect views)
4. Paste code below in Console tab
```

### Step 2: Run Diagnostic
```javascript
// === API RECORDING DIAGNOSTIC ===
console.log('\n🔍 API RECORDING DIAGNOSTIC\n');
console.log('='.repeat(50));

// Check variables
console.log('\n📊 Current State:');
console.log('  Recording:', typeof isApiRecording !== 'undefined' ? isApiRecording : '❌ Variable not found');
console.log('  Tab ID:', typeof recordingTabId !== 'undefined' ? recordingTabId : '❌ Variable not found');
console.log('  Attached Tabs:', typeof attachedTabIds !== 'undefined' ? Array.from(attachedTabIds) : '❌ Variable not found');

// Check debugger status
console.log('\n🔌 Debugger Status:');
chrome.debugger.getTargets().then(targets => {
  const attached = targets.filter(t => t.attached);
  console.log('  Attached debuggers:', attached.length);
  attached.forEach(t => {
    console.log(`    - Tab ${t.tabId}: ${t.url}`);
  });
  
  if (attached.length === 0) {
    console.log('  ℹ️ No debuggers currently attached');
  }
});

// Check tabs
console.log('\n🌐 Open Tabs:');
chrome.tabs.query({}, tabs => {
  console.log('  Total tabs:', tabs.length);
  const httpTabs = tabs.filter(t => t.url?.startsWith('http'));
  console.log('  HTTP/HTTPS tabs:', httpTabs.length);
  
  httpTabs.slice(0, 5).forEach(t => {
    console.log(`    - Tab ${t.id}: ${t.url?.substring(0, 60)}...`);
  });
});

// Check permissions
console.log('\n🔐 Permissions:');
chrome.permissions.getAll(perms => {
  console.log('  Has debugger permission:', perms.permissions?.includes('debugger') ? '✅' : '❌');
  console.log('  Has tabs permission:', perms.permissions?.includes('tabs') ? '✅' : '❌');
  console.log('  Has storage permission:', perms.permissions?.includes('storage') ? '✅' : '❌');
  console.log('  Host permissions:', perms.origins?.length || 0, 'origins');
});

// Check service
console.log('\n📦 API Testing Service:');
console.log('  Service loaded:', typeof apiTestingService !== 'undefined' ? '✅' : '❌');
if (typeof apiTestingService !== 'undefined') {
  try {
    const requests = apiTestingService.getCapturedRequests();
    console.log('  Captured requests:', requests.length);
    const tests = apiTestingService.getTestCases();
    console.log('  Test cases:', tests.length);
  } catch (e) {
    console.log('  ❌ Error accessing service:', e.message);
  }
}

console.log('\n='.repeat(50));
console.log('✅ Diagnostic complete!\n');

// Instructions
console.log('📝 Next Steps:');
console.log('  1. Check if "Recording: true" when you start recording');
console.log('  2. Verify "Tab ID" matches your app tab');
console.log('  3. Ensure all permissions show ✅');
console.log('  4. If debugger attached to wrong tab, reload extension');
console.log('\n');
```

---

## Interpret Results

### ✅ Good State
```
Recording: false (or true when recording)
Tab ID: 123456 (number)
Attached Tabs: [123456]
Has debugger permission: ✅
Has tabs permission: ✅
Has storage permission: ✅
Service loaded: ✅
```

### ❌ Problem States

#### No Variables
```
Recording: ❌ Variable not found
→ Solution: Extension not loaded properly, reload it
```

#### No Attached Tabs
```
Attached Tabs: []
→ Solution: Click Playwright icon on your app tab first
```

#### No Debugger Permission
```
Has debugger permission: ❌
→ Solution: manifest.json is wrong, rebuild extension
```

#### Service Not Loaded
```
Service loaded: ❌
→ Solution: Build failed or incomplete, run npm run build again
```

---

## Quick Tests

### Test 1: Can Attach Debugger?
```javascript
// Get first HTTP tab
chrome.tabs.query({ url: 'http://*/*' }, tabs => {
  if (tabs[0]) {
    const tabId = tabs[0].id;
    console.log('Testing on tab', tabId, tabs[0].url);
    
    chrome.debugger.attach({ tabId }, '1.3')
      .then(() => {
        console.log('✅ Can attach debugger!');
        return chrome.debugger.detach({ tabId });
      })
      .then(() => console.log('✅ Can detach debugger!'))
      .catch(err => console.log('❌ Debugger error:', err.message));
  } else {
    console.log('❌ No HTTP tabs found. Open http://localhost or https://example.com');
  }
});
```

### Test 2: Can Capture Requests?
```javascript
// Simulate request capture
const testRequest = {
  id: 'test-' + Date.now(),
  method: 'GET',
  url: 'https://api.example.com/test',
  headers: { 'Content-Type': 'application/json' },
  timestamp: Date.now()
};

if (typeof apiTestingService !== 'undefined') {
  apiTestingService.captureRequest(testRequest);
  const captured = apiTestingService.getCapturedRequests();
  console.log('✅ Captured requests:', captured.length);
  console.log('Last request:', captured[captured.length - 1]);
} else {
  console.log('❌ apiTestingService not loaded');
}
```

### Test 3: Can Store Data?
```javascript
// Test Chrome storage
chrome.storage.local.set({ test_key: 'test_value' })
  .then(() => chrome.storage.local.get('test_key'))
  .then(result => {
    if (result.test_key === 'test_value') {
      console.log('✅ Storage works!');
      chrome.storage.local.remove('test_key');
    }
  })
  .catch(err => console.log('❌ Storage error:', err));
```

---

## Manual Verification

### Check Extension Files
```
examples/recorder-crx/dist/
  ✓ manifest.json (exists)
  ✓ background.js (> 5 MB)
  ✓ index.js (> 400 KB)
  ✓ apiTestingService.js (> 10 KB)
```

### Check Build Output
```bash
cd examples/recorder-crx
npm run build

# Should show:
# ✓ built in XXs
# dist/background.js  ~5,390 kB
# dist/index.js       ~483 kB
```

### Check Chrome Version
```
Minimum: Chrome 88+
Recommended: Chrome 120+

Check: chrome://version/
```

---

## Common Patterns

### Pattern 1: "Works in demo, not in app"
```
✅ Demo data works
❌ Real recording doesn't work

Cause: App not making API calls
Solution: Check Network tab (F12) → See any XHR/Fetch requests?
```

### Pattern 2: "Worked before, not now"
```
Cause: Extension state corrupted
Solution: 
1. chrome://extensions/ → Remove extension
2. Reload page
3. Load extension again
```

### Pattern 3: "Works sometimes"
```
Cause: Tab switching or timing issue
Solution: Ensure Playwright attached BEFORE recording
```

---

## Emergency Fixes

### Fix 1: Complete Reset
```bash
# 1. Remove extension
chrome://extensions/ → Remove

# 2. Clear data
chrome.storage.local.clear()

# 3. Rebuild
cd examples/recorder-crx
npm run build

# 4. Reload
chrome://extensions/ → Load unpacked
```

### Fix 2: Force Detach All
```javascript
chrome.tabs.query({}, tabs => {
  tabs.forEach(tab => {
    chrome.debugger.detach({ tabId: tab.id }).catch(() => {});
  });
  console.log('✅ All debuggers detached');
});
```

### Fix 3: Clear Service Data
```javascript
if (typeof apiTestingService !== 'undefined') {
  apiTestingService.clearCapturedRequests();
  console.log('✅ Captured requests cleared');
}
```

---

## Reporting Template

If diagnostics show errors, report with this info:

```
### Environment
- Chrome Version: [from chrome://version/]
- Extension Version: [from chrome://extensions/]
- OS: Windows/Mac/Linux

### Diagnostic Results
[Paste diagnostic output]

### What Doesn't Work
- [ ] Starting recording
- [ ] Capturing requests
- [ ] Viewing details
- [ ] Creating tests

### Steps to Reproduce
1. 
2. 
3. 

### Expected vs Actual
Expected: [what should happen]
Actual: [what actually happens]

### Console Errors
[Any red errors from console]
```

---

**Run the diagnostic script above first before reporting issues!**
