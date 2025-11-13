# 🔐 Authentication Guide for Test Executor

## 🎯 Overview

The Test Executor now includes **built-in authentication** to access saved scripts from the cloud. No more confusing error messages - just a simple login flow!

---

## ✨ New Authentication Features

### 1. **Authentication Status Indicator** 🚦
- **Green Dot (🟢)**: Logged In - Scripts accessible
- **Red Dot (🔴)**: Not Logged In - Login required

### 2. **One-Click Login** 🖱️
- Click "Login" button to open login form
- Enter credentials
- Auto-loads scripts after successful login

### 3. **Session Persistence** 💾
- Login persists across browser sessions
- Tokens stored securely in Chrome storage
- Auto-login on next visit

### 4. **Easy Logout** 🚪
- One-click logout
- Clears tokens and scripts
- Ready for new login

---

## 🚀 How to Use

### **Step 1: Open Test Executor**

1. Click the **Execute (▶️)** button in the recorder toolbar
2. The Test Executor panel opens

---

### **Step 2: Check Authentication Status**

At the top of the panel, you'll see:

**If Not Logged In:**
```
┌────────────────────────────────────┐
│ 🔴 Not Logged In     [Login]      │
└────────────────────────────────────┘
```

**If Logged In:**
```
┌────────────────────────────────────┐
│ 🟢 Logged In         [Logout]     │
└────────────────────────────────────┘
```

---

### **Step 3: Login**

#### **Option A: Via UI (Easiest)**

1. Click the **"Login"** button
2. A login modal appears:

```
┌─────────────────────────────────────────┐
│ Login to Access Saved Scripts      [×] │
├─────────────────────────────────────────┤
│                                         │
│ Email:                                  │
│ ┌─────────────────────────────────────┐ │
│ │ your-email@example.com              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Password:                               │
│ ┌─────────────────────────────────────┐ │
│ │ ••••••••••••••                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  [       Login       ] [  Cancel  ]     │
│                                         │
│ 💡 Tip: Use the API service to         │
│    register if you don't have an        │
│    account.                             │
└─────────────────────────────────────────┘
```

3. Enter your credentials
4. Click **"Login"**
5. Status changes to **🟢 Logged In**
6. Scripts auto-load!

#### **Option B: Programmatic (for testing)**

```typescript
import { apiService } from './apiService';

// Login
await apiService.login('user@example.com', 'password123');

// The UI will auto-detect authentication
```

---

### **Step 4: Access Script Library**

Once logged in:

1. Click **"📚 Script Library"**
2. No error - scripts load successfully!
3. Select and execute scripts

---

### **Step 5: Logout (Optional)**

When done:

1. Click **"Logout"** button
2. Status changes to **🔴 Not Logged In**
3. Scripts cleared from memory
4. Tokens removed

---

## 🎨 UI Flow

### **Complete Flow Diagram**

```
┌─────────────────────────────────────────┐
│         Test Executor Panel             │
├─────────────────────────────────────────┤
│                                         │
│ 🔴 Not Logged In        [Login]  ←──┐  │
│                                      │  │
│ 📚 Script Library (0)               │  │
│ ↓ (Click)                           │  │
│ ┌─────────────────────────────┐    │  │
│ │ Login Modal Opens           │ ───┘  │
│ │ • Enter email               │       │
│ │ • Enter password            │       │
│ │ • Click Login               │       │
│ └─────────────────────────────┘       │
│          ↓ (Success)                  │
│ 🟢 Logged In           [Logout]       │
│                                       │
│ 📚 Script Library (5)  ← Scripts!    │
│ ✅ Selected: My Test                 │
│ [▶️ Run Selected]                     │
└───────────────────────────────────────┘
```

---

## 📋 Error Handling

### **Error: Login Failed**

```
┌─────────────────────────────────────┐
│ ❌ Login failed. Please check your  │
│    credentials.                     │
└─────────────────────────────────────┘
```

**Solution:**
- Verify email and password
- Check if account exists
- Register if needed

### **Error: Failed to Load Scripts**

```
┌─────────────────────────────────────┐
│ ❌ Failed to load saved scripts.    │
│    Please try again.                │
└─────────────────────────────────────┘
```

**Solution:**
- Check internet connection
- Verify backend API is running
- Click "🔄 Refresh" in script library

### **Error: Token Expired**

If your session expires:
- Status automatically changes to **🔴 Not Logged In**
- Just login again
- Tokens refresh automatically

---

## 🔧 Registration

### **Create an Account**

#### **Option 1: Via Code (Developer)**

```typescript
import { apiService } from './apiService';

// Register new account
await apiService.register(
  'newuser@example.com',  // email
  'securePassword123',     // password
  'Your Name'              // name
);

// Auto-logged in after registration!
```

#### **Option 2: Via Backend API**

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "Your Name"
  }'
```

#### **Option 3: Via UI** (If Implemented)

You can add a "Register" link in the login modal:

```typescript
// In login form, add:
<div className="register-link">
  Don't have an account?
  <button onClick={handleRegister}>Register</button>
</div>
```

---

## 🔐 Security Features

### **1. Token Storage**
- Tokens stored in `chrome.storage.local`
- Encrypted by Chrome
- Isolated per extension
- Not accessible to web pages

### **2. Token Auto-Refresh**
- Access tokens expire after 1 hour
- Refresh token lasts 7 days
- Auto-refresh on API calls
- Seamless re-authentication

### **3. Secure Communication**
- All API calls over HTTPS (in production)
- Bearer token authentication
- No password storage
- Token-based session management

### **4. Logout Cleanup**
- Clears all tokens
- Removes from storage
- Clears in-memory data
- Complete session termination

---

## 💡 Best Practices

### **1. Account Management**
- Use strong passwords
- Don't share credentials
- Logout from shared computers
- Use different passwords per environment

### **2. Session Handling**
- Login once per browser
- Tokens persist automatically
- Logout when done (optional)
- Re-login if token expires

### **3. Testing**
- Use test accounts for development
- Production credentials for production
- Separate API endpoints per environment

### **4. Troubleshooting**
- Check authentication status first
- Try logout/login if issues occur
- Verify backend is running
- Check browser console for errors

---

## 🎯 Usage Examples

### **Example 1: First Time User**

```typescript
// 1. Open Test Executor
// 2. See: 🔴 Not Logged In [Login]
// 3. Click "Login"
// 4. Enter credentials:
//    Email: developer@company.com
//    Password: dev@2025!
// 5. Click "Login"
// 6. See: 🟢 Logged In [Logout]
// 7. Click "📚 Script Library"
// 8. See your saved scripts!
```

### **Example 2: Returning User**

```typescript
// 1. Open Test Executor
// 2. Auto-authenticated! 🟢 Logged In
// 3. Scripts already loaded
// 4. Click "📚 Script Library"
// 5. Select and run scripts immediately
```

### **Example 3: Logout and Re-Login**

```typescript
// 1. Currently: 🟢 Logged In
// 2. Click "Logout"
// 3. Now: 🔴 Not Logged In
// 4. Click "Login"
// 5. Enter different credentials
// 6. Access different user's scripts
```

---

## 🔄 Authentication Flow (Technical)

### **Login Sequence**

```
1. User clicks "Login" button
   ↓
2. Login modal appears
   ↓
3. User enters email + password
   ↓
4. Form submitted to apiService.login()
   ↓
5. POST /api/auth/login
   ↓
6. Backend validates credentials
   ↓
7. Returns { user, tokens }
   ↓
8. Tokens stored in chrome.storage.local
   ↓
9. setIsAuthenticated(true)
   ↓
10. loadSavedScripts() called
    ↓
11. Scripts displayed in UI
```

### **Auto-Authentication on Load**

```
1. Component mounts
   ↓
2. checkAuthentication() called
   ↓
3. apiService.loadTokens()
   ↓
4. Load from chrome.storage.local
   ↓
5. apiService.getProfile() - validate token
   ↓
6. If success: setIsAuthenticated(true)
   ↓
7. loadSavedScripts() auto-called
   ↓
8. Scripts available immediately
```

---

## 🚦 Status Indicators

| Indicator | Meaning | Action Available |
|-----------|---------|------------------|
| 🔴 Not Logged In | No active session | Login |
| 🟢 Logged In | Active session | Logout, Access Scripts |
| ⏳ Logging in... | Login in progress | Wait |
| ❌ Login Failed | Invalid credentials | Retry |

---

## 📊 Comparison: Before vs After

### **Before** ❌
```
1. Click "Script Library"
2. Error: "Failed to load saved scripts.
   Please ensure you are logged in."
3. Confused - how to login?
4. Manual apiService.login() in console
5. Reload extension
6. Try again
```

### **After** ✅
```
1. See authentication status: 🔴 Not Logged In
2. Click "Login" button
3. Enter credentials in modal
4. Auto-authenticated: 🟢 Logged In
5. Scripts auto-loaded
6. Click "Script Library"
7. Works immediately!
```

---

## 🎉 Summary

### **What You Get:**

✅ **Visual Authentication Status** - Know your login state at a glance
✅ **One-Click Login** - Simple modal form
✅ **Auto-Authentication** - Persistent sessions
✅ **Error-Free Experience** - No more confusing errors
✅ **Easy Logout** - Clean session management
✅ **Secure Storage** - Tokens safely stored
✅ **Auto-Script Loading** - Scripts load after login

### **Key Features:**

| Feature | Status |
|---------|--------|
| Authentication Status Indicator | ✅ |
| Login Modal | ✅ |
| Session Persistence | ✅ |
| Auto-Load Scripts | ✅ |
| Logout | ✅ |
| Error Handling | ✅ |
| Token Management | ✅ |

---

## 🔗 Related Files

- [`testExecutorUI.tsx`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/testExecutorUI.tsx) - Authentication UI
- [`apiService.ts`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/apiService.ts) - API & Auth logic
- [`crxRecorder.css`](file:///c:/play-crx-feature-test-execution/examples/recorder-crx/src/crxRecorder.css) - Login styles

---

**Now you can access saved scripts without any authentication errors!** 🎊
