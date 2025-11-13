# Extension Reload & Testing Guide

## ✅ Fixed Issues

### 1. **Backend Server** - Now Running ✓
- Server is running on `http://localhost:3000`
- Health check: http://localhost:3000/health
- WebSocket: ws://localhost:3000/ws

### 2. **Manifest Permissions** - Updated ✓
- Added explicit `host_permissions` for `http://localhost:3000/*`
- This allows the extension to make fetch requests to the backend

### 3. **Allure Service** - Fixed ✓
- Removed problematic `InMemoryAllureWriter` dependency
- Using file-based approach instead

---

## 🔄 How to Reload the Extension

1. **Open Chrome Extensions Page**
   - Navigate to: `chrome://extensions/`
   - OR click the puzzle icon → "Manage Extensions"

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Reload the Extension**
   - Find "Playwright CRX" in the list
   - Click the **circular reload icon** 🔄
   - OR click "Remove" and then "Load unpacked" again:
     - Click "Load unpacked"
     - Select folder: `c:\play-crx-feature-test-execution\examples\recorder-crx\dist`

---

## 🧪 Testing the Login

### Step 1: Open the Extension
- Click the Playwright CRX extension icon in Chrome toolbar
- You should see the **login screen** immediately

### Step 2: Login with Demo Credentials
```
Email: demo@example.com
Password: demo123
```

### Step 3: Verify Authentication
- After successful login, you should see the recorder UI
- The login screen should disappear
- Top-right corner should show your email and a logout button

---

## 🐛 Troubleshooting

### If you still see "Failed to fetch"

1. **Check Backend is Running**
   ```powershell
   # Test the health endpoint
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok"}`

2. **Check Browser Console**
   - Right-click on the extension popup → "Inspect"
   - Look for error messages in the Console tab
   - Check the Network tab for failed requests

3. **Check Extension Console**
   - Go to `chrome://extensions/`
   - Find "Playwright CRX"
   - Click "service worker" or "Inspect views: background page"
   - Look for errors in the console

4. **Verify CORS is Working**
   - Backend `.env` has: `ALLOWED_ORIGINS="chrome-extension://*,http://localhost:5173,http://localhost:5174,http://localhost:3000"`
   - This allows requests from any chrome extension

### If Backend Stops Running

```powershell
# Navigate to backend directory
cd c:\play-crx-feature-test-execution\playwright-crx-enhanced\backend

# Start the server
npm run dev
```

### If You Need to Clear Extension Storage

1. Open Chrome DevTools on the extension popup (right-click → Inspect)
2. Go to **Application** tab → **Storage** → **Clear site data**
3. Reload the extension

---

## 📊 What Was Changed

### Files Modified:

1. **`manifest.json`**
   - Added explicit host permissions for localhost:3000
   - This fixes the "Failed to fetch" CORS issue

2. **`allure.service.ts`**
   - Removed broken `InMemoryAllureWriter` import
   - Using direct file-based Allure reporting

### Build Output:
- Extension rebuilt successfully in 24.46s
- All modules compiled without errors
- New `dist/` folder ready for loading

---

## 🎯 Expected Behavior

✅ **Correct Flow:**
1. Click extension icon
2. See login screen with gradient background
3. Enter credentials
4. Click "Login" button
5. See recorder UI with tabs: Actions, Execute, API, etc.
6. Logout button visible in top-right

❌ **Previous Issue:**
- "Failed to fetch" error due to missing backend server
- CORS errors due to manifest permissions

---

## 🔑 Test Credentials

```
Email: demo@example.com
Password: demo123
```

This account should already exist in your database. If it doesn't, you can create it using:

```powershell
cd c:\play-crx-feature-test-execution\playwright-crx-enhanced\backend
npm run seed  # If you have a seed script
```

Or register a new account through the extension's login screen (if registration is enabled).

---

## 📝 Next Steps

1. **Reload the extension** in Chrome
2. **Test the login** with demo credentials
3. **Verify all features work**: recorder, API testing, execution, etc.

If you encounter any other issues, check the browser console and extension service worker console for detailed error messages.
