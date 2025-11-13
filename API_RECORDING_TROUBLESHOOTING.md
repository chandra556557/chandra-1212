# API Recording Not Working - Troubleshooting Guide

## Quick Diagnosis Checklist

Run through this checklist to identify your specific issue:

### ✅ Step 1: Basic Setup
- [ ] Extension is loaded in Chrome (`chrome://extensions/`)
- [ ] Extension is enabled (toggle is ON)
- [ ] Extension was built recently (`npm run build`)
- [ ] Extension was reloaded after build
- [ ] Playwright is attached to a tab (not just opened)

### ✅ Step 2: Check Recording Status
- [ ] Clicked "API" button in toolbar
- [ ] Clicked "▶️ Start Recording" button
- [ ] Status shows "🔴 Recording..." (not "⚫ Not Recording")
- [ ] No error alert appeared

### ✅ Step 3: Verify Network Activity
- [ ] Actually interacted with your app after starting recording
- [ ] App makes HTTP/HTTPS requests (not just static page loads)
- [ ] Not on chrome:// pages (must be http:// or https://)
- [ ] Waited a few seconds for requests to appear

---

## Common Issues & Solutions

### Issue #1: "No requests captured"

**Symptoms:**
- Recording status shows "🔴 Recording..."
- But request list stays at "(0)"
- Empty state message visible

**Possible Causes:**

#### A) Not interacting with app
```
❌ Started recording → Waiting...
✅ Started recording → Click buttons, submit forms, load data
```

**Solution:**
```
1. Click "Start Recording"
2. Go to your app tab
3. Login, browse, click buttons, submit forms
4. Check extension → Should see requests!
```

#### B) Only static content loading
```
❌ Static HTML page with no API calls
✅ React/Angular/Vue app that fetches data
```

**Solution:**
```javascript
// Your app should make fetch/axios calls like:
fetch('http://localhost:3000/api/users')
  .then(res => res.json())
  .then(data => console.log(data));

// These will be captured!
```

#### C) Requests are filtered out
```
❌ Loading images: logo.png, style.css, fonts.woff
✅ API calls: /api/users, /auth/login, /data/products
```

**Check Console:**
```javascript
// Press F12 on extension → Console tab
// Look for: "Ignoring request: [URL]"
```

**What gets filtered:**
- Images (.png, .jpg, .gif, .svg)
- Fonts (.woff, .woff2, .ttf)
- Chrome extension URLs (chrome-extension://)
- Chrome internal URLs (chrome.google.com)

#### D) Recording wrong tab
```
❌ Recording Tab A, but interacting with Tab B
✅ Recording Tab A, interacting with Tab A
```

**Solution:**
```
1. Make sure Playwright is attached to YOUR app's tab
2. Check console: "Using Playwright-attached tab for API recording: [ID]"
3. That tab ID should match your app's tab
```

---

### Issue #2: "Another debugger already attached"

**Error Message:**
```
❌ Failed to start recording: Another debugger is already attached to tab
```

**Solution:**
```
1. Close Chrome DevTools (F12) on your app tab
2. Reload extension (chrome://extensions/)
3. Click "Start Recording" again
```

**See:** `DEBUGGER_CONFLICT_FIX.md` for full details

---

### Issue #3: "Failed to start recording" (No tab found)

**Error Message:**
```
❌ Failed to start recording
Make sure Playwright is attached to a tab
```

**Cause:** Playwright is not attached to any tab

**Solution:**
```
1. Navigate to your application (e.g., http://localhost:5173)
2. Click Playwright extension icon
3. Wait for recorder to open
4. THEN click "API" → "Start Recording"
```

**Verify Attachment:**
```javascript
// In extension background console:
console.log('Attached tabs:', Array.from(attachedTabIds));
// Should show: [123456]
```

---

### Issue #4: "Recording status stuck"

**Symptoms:**
- Click "Start Recording"
- Button changes but status doesn't update
- Or status shows recording but button still says "Start"

**Solution:**
```
1. Click "Stop Recording" (if visible)
2. Reload extension
3. Refresh your app page
4. Start recording again
```

---

### Issue #5: Extension not loading

**Symptoms:**
- Can't find "API" button
- Extension doesn't open
- Blank screen when clicking icon

**Solutions:**

#### A) Need to rebuild
```bash
cd examples/recorder-crx
npm run build
```

#### B) Need to reload
```
chrome://extensions/ → Find "Playwright CRX" → Click "Reload"
```

#### C) Loaded wrong folder
```
Must load: examples/recorder-crx/dist/
NOT: examples/recorder-crx/src/
```

---

### Issue #6: Requests captured but no details

**Symptoms:**
- Requests appear in list
- But clicking shows empty details
- No request/response bodies

**Possible Causes:**

#### A) Response body too large
```
Response > 10MB → Body not captured
```

#### B) Binary response
```
Images, PDFs → Body shows as base64 or empty
```

#### C) Network error
```
Request failed before response → No body
```

**Check:**
```javascript
// Click request → Look for:
- Status code (200, 404, etc.)
- Response time
- Headers present?
- Body field empty or has data?
```

---

## Detailed Debugging Steps

### Step 1: Verify Extension State

**Open Extension Console:**
```
1. chrome://extensions/
2. Find "Playwright CRX"
3. Click "background page" (under Inspect views)
4. Console tab opens
```

**Check Variables:**
```javascript
// Type in console:
isApiRecording
// Should show: false (when not recording) or true (when recording)

recordingTabId
// Should show: number (e.g., 123456) when recording

Array.from(attachedTabIds)
// Should show: [123456] (tab IDs where Playwright is attached)
```

### Step 2: Test with Demo Data

**Quick Test:**
```
1. Click "API" button
2. Click "+ Demo Data" button
3. Check "Recorder" tab
4. Should see sample request instantly!
```

**If demo data works:**
✅ UI is working
✅ Storage is working  
❌ Network capture is the issue

**If demo data doesn't work:**
❌ Service/Storage issue
→ Reload extension and try again

### Step 3: Monitor Console Logs

**What to look for:**

**Success:**
```
✅ API Recording started on tab 123456
Using Playwright-attached tab for API recording: 123456
Network.requestWillBeSent: GET https://yourapp.com/api/users
Network.responseReceived: 200 OK
```

**Errors:**
```
❌ No valid tab found for API recording
❌ Another debugger is already attached
❌ Failed to attach debugger
```

**Warnings:**
```
⚠️ Ignoring request: chrome-extension://...
⚠️ Another debugger is attached. Attempting to detach and retry...
```

### Step 4: Test Network Capture

**Use Test API:**
```
1. Start recording
2. Open new tab
3. Navigate to: https://jsonplaceholder.typicode.com/posts
4. Check extension → Should capture the GET request!
```

**If this works:**
✅ Recording works
❌ Your app might not be making API calls

**If this doesn't work:**
❌ Core issue with debugger attachment
→ Check DevTools conflicts, permissions

### Step 5: Check Permissions

**In manifest.json:**
```json
{
  "permissions": [
    "debugger",     ← Required!
    "tabs",         ← Required!
    "storage"       ← Required!
  ],
  "host_permissions": [
    "<all_urls>"    ← Required!
  ]
}
```

**Verify:**
```
chrome://extensions/ → Playwright CRX → Details → Permissions
Should show:
✓ Debugger
✓ Read and change all your data on all websites
✓ Tabs
```

---

## Advanced Diagnostics

### Check if debugger is actually attached

**In your app's console (F12):**
```javascript
// If you see this banner:
"Chrome is being controlled by automated test software"
→ Debugger IS attached ✅

// If no banner:
→ Debugger NOT attached ❌
```

### Monitor debugger events

**In background console:**
```javascript
// Add temporary logging:
chrome.debugger.onEvent.addListener((source, method, params) => {
  console.log('[Debugger Event]', method, source.tabId, params);
});

// Start recording → Should see:
// Network.requestWillBeSent
// Network.responseReceived
// Network.loadingFinished
```

### Force detach all debuggers

**Emergency reset:**
```javascript
// In background console:
chrome.tabs.query({}, tabs => {
  tabs.forEach(tab => {
    chrome.debugger.detach({ tabId: tab.id })
      .then(() => console.log('Detached from', tab.id))
      .catch(() => {});
  });
});

// Then reload extension and try again
```

---

## Testing Workflow

### Recommended Test Sequence:

```bash
# 1. Start backend (if using local API)
cd playwright-crx-enhanced/backend
npm run dev
# → Backend running on http://localhost:3000

# 2. Start frontend
cd ../frontend
npm run dev
# → Frontend running on http://localhost:5173

# 3. Build extension
cd ../../examples/recorder-crx
npm run build
# → Built to dist/

# 4. Load extension
# chrome://extensions/ → Load unpacked → Select dist/

# 5. Test extension
# Navigate to http://localhost:5173
# Click Playwright icon → Login
# Click "API" → "Start Recording"
# Login to app, browse, etc.
# Stop recording → Check captured requests
```

---

## Error Code Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `No valid tab found` | Playwright not attached | Attach to a tab first |
| `Another debugger` | DevTools open | Close DevTools (F12) |
| `Cannot access chrome://` | Wrong tab type | Use http:// or https:// |
| `Runtime error` | Extension issue | Reload extension |
| `Network.enable failed` | Debugger conflict | Detach and retry |

---

## Still Not Working?

### Collect Debug Info:

1. **Extension Console Logs**
   ```
   chrome://extensions/ → Background page → Copy console output
   ```

2. **Extension State**
   ```javascript
   // In background console:
   console.log({
     isRecording: isApiRecording,
     tabId: recordingTabId,
     attached: Array.from(attachedTabIds)
   });
   ```

3. **Chrome Version**
   ```
   chrome://version/
   ```

4. **Extension Version**
   ```
   chrome://extensions/ → Playwright CRX → Version
   ```

5. **Error Messages**
   ```
   Screenshot of any error alerts
   ```

### Report Issue With:
- Steps to reproduce
- Expected vs actual behavior  
- Console logs
- Chrome version
- Extension version
- Screenshots/errors

---

## Quick Fixes Summary

| Symptom | Quick Fix |
|---------|-----------|
| No requests | Interact with your app after starting recording |
| Debugger error | Close DevTools (F12), reload extension |
| No tab found | Attach Playwright to a tab first |
| Stuck state | Reload extension, refresh page |
| Not loading | Rebuild extension (`npm run build`) |

---

## Documentation Files

- `API_RECORDING_GUIDE.md` - Complete usage guide
- `API_RECORDING_FIX.md` - Dynamic recording implementation
- `DEBUGGER_CONFLICT_FIX.md` - Debugger conflict solutions
- `API_RECORDING_QUICK_START.md` - Quick start guide

---

**Most Common Issue:** Not interacting with app after starting recording!

**Quick Test:** Use "+ Demo Data" button → If that works, then interact more with your app.

**Last Resort:** Restart Chrome completely and try again.
