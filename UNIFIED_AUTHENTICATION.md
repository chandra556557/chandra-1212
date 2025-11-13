# 🔐 Unified Authentication Guide

**Single sign-on across Frontend App and Chrome Extension**

---

## 🎯 Overview

The Playwright-CRX platform uses **unified authentication** where the same login credentials work across:

✅ **Frontend React Dashboard** (`http://localhost:5174`)
✅ **Chrome Extension** (Recorder UI)
✅ **Backend API** (`http://localhost:3000`)

**One account, multiple interfaces!**

---

## 🔑 How It Works

### Authentication Flow

```mermaid
graph LR
    User[User] --> Frontend[Frontend Login]
    User --> Extension[Extension Login]

    Frontend --> Backend[Backend API /auth/login]
    Extension --> Backend

    Backend --> DB[(PostgreSQL)]

    Backend --> FrontendToken[JWT Token → localStorage]
    Backend --> ExtensionToken[JWT Token → Chrome Storage]
```

### Shared Backend

Both interfaces authenticate against the **same backend API**:

```typescript
// Backend Authentication Endpoint
POST http://localhost:3000/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "tokens": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

### Shared Database

All user accounts are stored in the **same PostgreSQL database**:

```
Database: playwright_crx
Table: User
  - id
  - email (unique)
  - password (hashed with bcrypt)
  - name
  - createdAt
  - updatedAt
```

---

## 👤 User Accounts

### Default Demo Account

Both frontend and extension come pre-configured with demo credentials:

```
Email: demo@example.com
Password: demo123
```

**This account is created during database seeding.**

### Create New Account

#### Option 1: Via Backend API (Recommended)

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "yourpassword",
    "name": "Your Name"
  }'
```

#### Option 2: Via Database Seed Script

Edit `backend/prisma/seed.ts`:

```typescript
// Add your user
await prisma.user.create({
  data: {
    email: 'yourname@example.com',
    password: await bcrypt.hash('yourpassword', 10),
    name: 'Your Name'
  }
});
```

Then run:
```bash
cd playwright-crx-enhanced/backend
npm run seed
```

---

## 🖥️ Frontend App Login

### Access Dashboard

```bash
# Start frontend (if not running)
cd playwright-crx-enhanced/frontend
npm run dev

# Open browser
http://localhost:5174
```

### Login Screen

The frontend shows:
- Email input field
- Password input field
- Login button
- Demo credentials hint: `demo@example.com / demo123`

### After Login

- **Token Storage**: `localStorage.setItem('accessToken', token)`
- **Auto-load**: Dashboard loads scripts and test runs
- **Persistent Session**: Token persists across page refreshes
- **Logout**: Clears token from localStorage

---

## 🧩 Extension Login

### Access Extension

```bash
# Load extension in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select: examples/recorder-crx/dist
```

### Login via Test Executor

1. Open the extension (click icon or `Alt+Shift+R`)
2. Enable "Experimental Features" in settings
3. Click **"Execute"** button (Test Executor)
4. Click **"Login"** button
5. Enter credentials:
   - Email: `demo@example.com`
   - Password: `demo123`
6. Click "Login"

### Login via API Testing Suite

1. Click **"API"** button
2. Use authenticated endpoints (requires login)
3. Login prompt appears if not authenticated

### After Login

- **Token Storage**: `chrome.storage.local` (auth_tokens)
- **Auto-load**: Scripts loaded from backend
- **Persistent Session**: Tokens persist across extension reloads
- **Logout**: Clears tokens from Chrome storage

---

## 🔄 Cross-Platform Session Management

### Independent Sessions

Frontend and Extension maintain **independent sessions**:

```
Frontend Session:
  - Stored in: localStorage
  - Scope: Browser tab/domain
  - Cleared on: Logout button or localStorage.clear()

Extension Session:
  - Stored in: chrome.storage.local
  - Scope: Extension context
  - Cleared on: Extension logout or storage.clear()
```

### Benefits

✅ **Flexibility**: Login on one doesn't require login on the other
✅ **Security**: Sessions are isolated
✅ **Convenience**: Can be logged in on both simultaneously

---

## 🔐 Security Features

### Password Hashing

```typescript
// Backend uses bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
```

### JWT Tokens

```typescript
// Access Token: 15 minutes (short-lived)
JWT_ACCESS_SECRET

// Refresh Token: 7 days (long-lived)
JWT_REFRESH_SECRET
```

### Token Refresh

Both frontend and extension support automatic token refresh:

```typescript
// When access token expires (401)
POST /api/auth/refresh
{
  "refreshToken": "eyJhbG..."
}

Response:
{
  "tokens": {
    "accessToken": "new_token...",
    "refreshToken": "new_refresh..."
  }
}
```

---

## 🛠️ Configuration

### Backend Environment

File: `playwright-crx-enhanced/backend/.env`

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/playwright_crx"
JWT_ACCESS_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-key"
PORT=3000
ALLOWED_ORIGINS="chrome-extension://your-extension-id,http://localhost:5174"
```

### Frontend Configuration

File: `playwright-crx-enhanced/frontend/src/App.tsx`

```typescript
const API_URL = 'http://localhost:3000/api';
```

### Extension Configuration

File: `examples/recorder-crx/src/apiService.ts`

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

**All three point to the same backend!**

---

## 📝 Common Credentials Setup

### Step 1: Start Backend

```bash
cd playwright-crx-enhanced/backend
npm run dev
```

### Step 2: Ensure Demo User Exists

```bash
# Run database seed
npm run seed
```

This creates:
```
Email: demo@example.com
Password: demo123
Name: Demo User
```

### Step 3: Login on Frontend

```bash
cd ../frontend
npm run dev
# Open http://localhost:5174
# Login with demo@example.com / demo123
```

### Step 4: Login on Extension

```bash
# Load extension in Chrome
# Click extension icon
# Enable experimental features
# Click "Execute" → "Login"
# Use same credentials: demo@example.com / demo123
```

**✅ Same credentials work on both!**

---

## 🎯 Testing Unified Auth

### Test Scenario: Same User, Both Platforms

```
1. Create user via backend:
   POST /api/auth/register
   {
     "email": "test@example.com",
     "password": "test123",
     "name": "Test User"
   }

2. Login on Frontend:
   - Go to http://localhost:5174
   - Enter: test@example.com / test123
   - ✅ Success: Dashboard loads

3. Login on Extension:
   - Open extension
   - Click "Execute" → "Login"
   - Enter: test@example.com / test123
   - ✅ Success: Scripts loaded

Result: ✅ Same credentials work on both platforms!
```

---

## 🔍 Verification Checklist

### Backend Running
```bash
curl http://localhost:3000/api/health
# Should return: {"status": "ok"}
```

### Database Connected
```bash
cd playwright-crx-enhanced/backend
npx prisma studio
# Should open database viewer
```

### Users Created
```sql
-- Check users in database
SELECT email, name FROM "User";
```

### Frontend Auth Working
```bash
# Open browser console at http://localhost:5174
localStorage.getItem('accessToken')
# Should show token after login
```

### Extension Auth Working
```javascript
// Open extension console (background.js)
chrome.storage.local.get(['auth_tokens'], (result) => {
  console.log(result.auth_tokens);
});
// Should show tokens after login
```

---

## 🐛 Troubleshooting

### "Login failed" on Frontend

**Check:**
1. Backend is running: `http://localhost:3000`
2. CORS allows frontend origin: Check `ALLOWED_ORIGINS` in `.env`
3. Database is accessible
4. Credentials are correct

**Solution:**
```bash
# Restart backend
cd playwright-crx-enhanced/backend
npm run dev
```

### "Login failed" on Extension

**Check:**
1. Backend is running
2. Extension ID is in `ALLOWED_ORIGINS`
3. Network tab shows request to `http://localhost:3000/api/auth/login`

**Solution:**
```bash
# Get extension ID
chrome://extensions/
# Copy ID, update backend .env
ALLOWED_ORIGINS="chrome-extension://YOUR_EXTENSION_ID,http://localhost:5174"
# Restart backend
```

### "User not found"

**Check:**
```bash
cd playwright-crx-enhanced/backend
npx prisma studio
# Check if user exists in User table
```

**Solution:**
```bash
# Create demo user
npm run seed
```

---

## 📊 User Management

### View All Users

```bash
cd playwright-crx-enhanced/backend
npx prisma studio
# Navigate to User table
```

### Create User Programmatically

```typescript
// Using Prisma
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

await prisma.user.create({
  data: {
    email: 'newuser@example.com',
    password: await bcrypt.hash('newpassword', 10),
    name: 'New User'
  }
});
```

### Delete User

```typescript
await prisma.user.delete({
  where: { email: 'user@example.com' }
});
```

---

## 🎓 Best Practices

### Password Security
✅ **Do**: Use strong passwords (min 8 characters)
✅ **Do**: Hash passwords with bcrypt
❌ **Don't**: Store plain-text passwords
❌ **Don't**: Share credentials

### Token Management
✅ **Do**: Store tokens securely (localStorage/chrome.storage)
✅ **Do**: Implement token refresh
❌ **Don't**: Expose tokens in logs
❌ **Don't**: Share access tokens

### Production Deployment
✅ **Do**: Change JWT secrets
✅ **Do**: Use HTTPS
✅ **Do**: Implement rate limiting
✅ **Do**: Enable CORS restrictions

---

## 🚀 Quick Reference

### Default Credentials
```
Email: demo@example.com
Password: demo123
```

### API Endpoints
```
POST /api/auth/register - Create account
POST /api/auth/login    - Login
POST /api/auth/refresh  - Refresh token
POST /api/auth/logout   - Logout
```

### Storage Locations
```
Frontend: localStorage['accessToken']
Extension: chrome.storage.local['auth_tokens']
Database: User table in playwright_crx
```

### Configuration Files
```
Backend:   backend/.env
Frontend:  frontend/src/App.tsx (API_URL)
Extension: examples/recorder-crx/src/apiService.ts (API_BASE_URL)
```

---

## ✅ Summary

**Unified Authentication is ACTIVE**

✅ Same backend API for both platforms
✅ Same database for user storage
✅ Same JWT token system
✅ Same demo credentials work everywhere
✅ Independent session management
✅ Secure password hashing
✅ Token refresh support

**Login once, test everywhere!** 🎉

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
**Status**: Production Ready ✅
