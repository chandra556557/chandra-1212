# 🔐 Unified Authentication - Quick Setup

**Get started with single sign-on in 5 minutes**

---

## ✅ Prerequisites

- ✅ PostgreSQL installed and running
- ✅ Node.js >= 18 installed
- ✅ Chrome browser

---

## 🚀 Quick Setup (5 Steps)

### Step 1: Start Backend (1 minute)

```bash
cd playwright-crx-enhanced/backend

# Install dependencies (first time only)
npm install

# Run database migrations (first time only)
npx prisma migrate dev

# Seed demo user (first time only)
npm run seed

# Start backend server
npm run dev
```

**Expected output:**
```
✓ Backend server running on http://localhost:3000
✓ Database connected
```

**Verify:**
```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok"}
```

---

### Step 2: Start Frontend (1 minute)

```bash
# Open new terminal
cd playwright-crx-enhanced/frontend

# Install dependencies (first time only)
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

**Verify:**
- Open browser: `http://localhost:5174`
- See login page with demo credentials hint

---

### Step 3: Load Extension (1 minute)

```bash
# Open new terminal (in project root)
cd examples/recorder-crx

# Build extension (first time only)
npm run build
```

**Load in Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select folder: `examples/recorder-crx/dist`

**Verify:**
- Extension appears in Chrome toolbar
- Click extension icon
- Recorder UI opens

---

### Step 4: Test Frontend Login (1 minute)

**Go to:** `http://localhost:5174`

**Login with:**
```
Email: demo@example.com
Password: demo123
```

**Expected:**
✅ Login successful
✅ Dashboard loads
✅ Scripts tab shows (0-n scripts)
✅ Test Runs tab shows recent runs

---

### Step 5: Test Extension Login (1 minute)

**In Extension:**
1. Click extension icon (or press `Alt+Shift+R`)
2. Click Settings (⚙️) → Enable "Experimental Features"
3. Click **"Execute"** button
4. Click **"Login"** button

**Login with same credentials:**
```
Email: demo@example.com
Password: demo123
```

**Expected:**
✅ Login successful
✅ "Authenticated as demo@example.com"
✅ "Load Scripts" button appears
✅ Scripts can be loaded from backend

---

## 🎉 You're Done!

**Unified authentication is working!**

Same credentials work on:
- ✅ Frontend Dashboard (`http://localhost:5174`)
- ✅ Chrome Extension (Test Executor)
- ✅ Backend API (`http://localhost:3000`)

---

## 🧪 Test the Integration

### Test 1: Create Script on Frontend, Access in Extension

**Frontend:**
```bash
1. Login to http://localhost:5174
2. (Scripts would be created via extension normally)
```

**Extension:**
```bash
1. Open extension
2. Record a test
3. Save script (requires login)
4. Script appears in frontend dashboard
```

### Test 2: Run Test in Extension, View Results in Frontend

**Extension:**
```bash
1. Open Test Executor
2. Login
3. Load and run a script
```

**Frontend:**
```bash
1. Go to "Test Runs" tab
2. See execution results
3. View pass/fail status
```

---

## 📝 Create Additional Users

### Method 1: Via API

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yourname@example.com",
    "password": "yourpassword",
    "name": "Your Name"
  }'
```

### Method 2: Via Database UI

```bash
cd playwright-crx-enhanced/backend
npx prisma studio
# Opens browser at http://localhost:5555
# Navigate to User model
# Click "+ Add record"
# Password must be bcrypt hashed
```

### Method 3: Via Seed Script

Edit `backend/prisma/seed.ts`:

```typescript
// Add your user
const yourUser = await prisma.user.create({
  data: {
    email: 'yourname@example.com',
    password: await bcrypt.hash('yourpassword', 10),
    name: 'Your Name'
  }
});
```

Run:
```bash
npm run seed
```

---

## 🔧 Troubleshooting

### Backend won't start

**Error:** `Port 3000 already in use`

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process or use different port
PORT=3001 npm run dev
```

**Error:** `Database connection failed`

**Solution:**
```bash
# Check PostgreSQL is running
# Update .env with correct credentials
# Run migrations
npx prisma migrate dev
```

### Frontend login fails

**Error:** `Network Error` or `CORS error`

**Solution:**
```bash
# Check backend is running on port 3000
curl http://localhost:3000/api/health

# Check CORS configuration in backend/.env
ALLOWED_ORIGINS="chrome-extension://*,http://localhost:5173,http://localhost:5174,http://localhost:3000"

# Restart backend
```

### Extension login fails

**Error:** `Failed to fetch`

**Solution:**
```bash
# Check backend is running
# Check extension ID is allowed in CORS
# Get extension ID from chrome://extensions/
# Update backend/.env:
ALLOWED_ORIGINS="chrome-extension://YOUR_EXTENSION_ID,http://localhost:5174,http://localhost:3000"

# Restart backend
```

### Demo user doesn't exist

**Solution:**
```bash
cd playwright-crx-enhanced/backend
npm run seed
# Creates demo@example.com / demo123
```

---

## 🎯 Quick Reference Card

```
┌─────────────────────────────────────────────────────┐
│           UNIFIED AUTHENTICATION SETUP              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Default Credentials:                                │
│   Email: demo@example.com                           │
│   Password: demo123                                 │
│                                                     │
│ Backend API: http://localhost:3000                  │
│ Frontend App: http://localhost:5174                 │
│ Extension: Chrome toolbar icon                      │
│                                                     │
│ Start Commands:                                     │
│   Backend:  cd backend && npm run dev               │
│   Frontend: cd frontend && npm run dev              │
│   Extension: Load dist/ in chrome://extensions/     │
│                                                     │
│ Verify Health:                                      │
│   curl http://localhost:3000/api/health             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📚 Next Steps

1. ✅ **Read:** [UNIFIED_AUTHENTICATION.md](./UNIFIED_AUTHENTICATION.md) - Complete guide
2. ✅ **Explore:** Login on both platforms
3. ✅ **Create:** Your own test user
4. ✅ **Test:** Record and execute tests
5. ✅ **Share:** Credentials with your team

---

## ✅ Success Checklist

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5174
- [ ] Extension loaded in Chrome
- [ ] Can login to frontend with demo credentials
- [ ] Can login to extension with demo credentials
- [ ] Same user account works on both platforms
- [ ] Scripts sync between frontend and extension
- [ ] Test runs appear in dashboard

**All checked?** You're ready to go! 🚀

---

**Setup Time:** ~5 minutes
**Difficulty:** Easy
**Support:** See [UNIFIED_AUTHENTICATION.md](./UNIFIED_AUTHENTICATION.md)
