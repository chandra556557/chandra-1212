# API Recording - Quick Start Guide

## 🚀 3-Step Setup

### 1️⃣ Reload Extension
```
chrome://extensions/ → Find "Playwright CRX" → Click "Reload"
```

### 2️⃣ Attach to Your App
```
1. Navigate to your app (e.g., http://localhost:5173)
2. Click Playwright extension icon
3. Login: demo@example.com / demo123
4. Recorder opens
```

### 3️⃣ Start Recording
```
1. Click "API" button in toolbar
2. Click "▶️ Start Recording"
3. Interact with your app (login, browse, etc.)
4. Click "⏹️ Stop Recording"
5. View captured API calls!
```

---

## 🎯 What's Fixed

**Before:** ❌ Recorded from active browser tab (wrong tab)  
**After:** ✅ Records from Playwright-attached tab (your app)

**Now you can:**
- ✅ Switch browser tabs while recording
- ✅ Record from the correct application
- ✅ See helpful error messages
- ✅ Get visual feedback during recording

---

## ✅ Quick Test

**Instant test (no app needed):**
```
1. Click "API" button
2. Click "+ Demo Data"
3. See sample request immediately!
```

**Real app test:**
```
1. Attach Playwright to your app
2. Click "API" → "Start Recording"
3. In your app: Make API calls (login, load data)
4. Stop recording → See captured requests!
```

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to start recording" | Make sure Playwright is attached to a tab |
| No requests captured | Interact with your app after starting recording |
| Empty list | Check console (F12) for errors |
| Wrong requests captured | Ensure Playwright is attached to YOUR app |

---

## 📊 What You'll See

```
Captured Requests (5)

GET  /api/users              200  125ms  [+ Test]
POST /api/auth/login         200  89ms   [+ Test]
GET  /api/products           200  156ms  [+ Test]
PUT  /api/settings           200  92ms   [+ Test]
```

**Click any request to see:**
- Full URL, method, headers
- Request body (JSON, form data)
- Response status, headers, body
- Response time

**Click "+ Test" to:**
- Create automated test case
- Add assertions (status, timing, body)
- Run test instantly
- Generate code (Playwright/Python/Java)

---

## 🎓 Console Logs

**Success:**
```
✅ API Recording started on tab 123456
Using Playwright-attached tab for API recording: 123456
```

**Error:**
```
❌ Failed to start API recording: [reason]
```

Open DevTools (F12) to see these logs!

---

## 📝 Files Modified

- `background.ts` - Smart tab selection
- `apiTestingUI.tsx` - Better error messages & UI

**Build output:** `examples/recorder-crx/dist/`

---

**Ready to test!** 🚀 Reload extension and start recording from your Playwright-attached app.
