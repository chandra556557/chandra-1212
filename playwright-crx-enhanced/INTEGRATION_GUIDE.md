# 🚀 Full-Stack Integration Guide

## 📋 Overview

This guide shows how to run the complete Playwright-CRX testing platform with:
- **Frontend**: React dashboard (Port 5173)
- **Backend**: Node.js/Express API (Port 3000)
- **Database**: PostgreSQL
- **Extension**: Chrome extension (existing recorder)

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────┐
│                  USERS                             │
└───┬──────────────────┬────────────────────┬────────┘
    │                  │                    │
    ▼                  ▼                    ▼
┌────────┐      ┌──────────────┐    ┌──────────────┐
│ Chrome │      │    React     │    │   Mobile/    │
│Extension◄─────┤  Dashboard   │    │   Other      │
│(Record)│      │ (localhost:  │    │   Clients    │
└───┬────┘      │    5173)     │    └──────┬───────┘
    │           └──────┬───────┘           │
    │                  │                   │
    │             REST API / WebSocket     │
    │                  │                   │
    └──────────────────┴───────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │   Node.js Backend (Express) │
         │      (localhost:3000)       │
         │  ┌──────────────────────┐   │
         │  │ • Authentication     │   │
         │  │ • Script Management  │   │
         │  │ • Test Execution     │   │
         │  │ • Self-Healing       │   │
         │  │ • Data-Driven Tests  │   │
         │  │ • WebSocket Server   │   │
         │  └──────────────────────┘   │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │   PostgreSQL Database        │
         │   • Users & Auth             │
         │   • Test Scripts             │
         │   • Execution Results        │
         │   • Self-Healing Data        │
         │   • Test Data Files          │
         └──────────────────────────────┘
```

---

## 🔧 Prerequisites

### **Required Software**

1. **Node.js** >= 20.0.0
   ```bash
   node --version  # Should be 20.x or higher
   ```

2. **PostgreSQL** >= 15
   ```bash
   psql --version  # Should be 15.x or higher
   ```

3. **npm** >= 10.0.0
   ```bash
   npm --version
   ```

---

## 📦 Installation

### **Step 1: Database Setup**

```bash
# Start PostgreSQL (if not running)
# Windows: Open Services → PostgreSQL → Start
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres
CREATE DATABASE playwright_crx;
CREATE USER playwright_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO playwright_user;
\q
```

### **Step 2: Backend Setup**

```bash
cd playwright-crx-enhanced/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Edit .env with your database credentials:
# DATABASE_URL="postgresql://playwright_user:your_password@localhost:5432/playwright_crx"
# JWT_ACCESS_SECRET="your-access-secret-change-this"
# JWT_REFRESH_SECRET="your-refresh-secret-change-this"
# PORT=3000

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed
```

### **Step 3: Frontend Setup**

```bash
cd ../frontend

# Install dependencies
npm install
```

### **Step 4: Extension Setup** (Already done)

The extension in `examples/recorder-crx` is already configured to connect to the backend via `apiService.ts`.

---

## ▶️ Running the Platform

### **Terminal 1: Start Backend**

```bash
cd playwright-crx-enhanced/backend
npm run dev

# Output:
# Server running on http://localhost:3000
# WebSocket server running on ws://localhost:3000
```

### **Terminal 2: Start Frontend**

```bash
cd playwright-crx-enhanced/frontend
npm run dev

# Output:
# Local: http://localhost:5173
# Network: use --host to expose
```

### **Terminal 3: Build Extension** (If needed)

```bash
cd examples/recorder-crx
npm run build

# Load extension in Chrome:
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select examples/recorder-crx/dist
```

---

## 🎯 Usage Workflow

### **1. Access the Dashboard**

Open http://localhost:5173 in your browser

```
┌─────────────────────────────────────────┐
│  Playwright-CRX Dashboard               │
├─────────────────────────────────────────┤
│  [Login / Register]                     │
│                                         │
│  After login:                           │
│  • Dashboard - Test overview           │
│  • Scripts - Manage test scripts       │
│  • Executions - View test runs         │
│  • Data Files - Upload CSV/JSON        │
│  • Self-Healing - Manage suggestions   │
│  • Analytics - Charts & metrics        │
└─────────────────────────────────────────┘
```

### **2. Register/Login**

**Option A: Via Dashboard**
- Click "Register"
- Enter email, password, name
- Login with credentials

**Option B: Via Extension**
- Open extension
- Click "Execute" button
- Click "Login"
- Enter credentials

### **3. Record a Test (Extension)**

```bash
# Open Chrome Extension
1. Click extension icon (or Alt+Shift+R)
2. Navigate to website
3. Perform actions
4. Right-click → Assert text/visibility
5. Click "Save" (if experimental enabled)
6. Script is saved to backend
```

### **4. Manage Tests (Dashboard)**

```
Dashboard → Scripts Tab:
├─ View all saved scripts
├─ Edit script code
├─ Delete scripts
├─ Execute scripts
├─ View execution history
└─ Download scripts
```

### **5. Execute Tests**

**Option A: From Dashboard**
- Scripts → Select script → Click "Run"
- Watch real-time execution
- View results

**Option B: From Extension**
- Execute button → Script Library
- Select saved script
- Click "Run Selected"

### **6. Data-Driven Testing**

```
1. Dashboard → Data Files → Upload CSV/JSON
2. Extension → Execute → Select data file
3. Click "Execute with Data"
4. Test runs once per row
```

---

## 📡 API Endpoints (Backend)

Base URL: `http://localhost:3000/api`

### **Authentication**
```
POST   /auth/register     - Register new user
POST   /auth/login        - Login
POST   /auth/refresh      - Refresh access token
POST   /auth/logout       - Logout
GET    /auth/me           - Get current user
```

### **Scripts**
```
GET    /scripts           - List all scripts
POST   /scripts           - Create script
GET    /scripts/:id       - Get script by ID
PUT    /scripts/:id       - Update script
DELETE /scripts/:id       - Delete script
POST   /scripts/:id/execute - Execute script
```

### **Test Runs**
```
GET    /test-runs         - List test runs
GET    /test-runs/:id     - Get test run details
GET    /test-runs/:id/steps - Get test steps
DELETE /test-runs/:id     - Delete test run
```

### **Data Files**
```
GET    /test-data/files   - List data files
POST   /test-data/upload  - Upload CSV/JSON
GET    /test-data/:id/rows - Get data rows
DELETE /test-data/:id     - Delete file
```

### **Self-Healing**
```
GET    /self-healing/:scriptId - Get suggestions
POST   /self-healing/record - Record locator failure
PUT    /self-healing/:id/approve - Approve suggestion
PUT    /self-healing/:id/reject - Reject suggestion
```

### **WebSocket**
```
WS     /ws                - Real-time test execution updates
```

---

## 🔐 Authentication Flow

```
1. User registers/logs in via Dashboard or Extension
   ↓
2. Backend returns:
   - accessToken (15min expiry)
   - refreshToken (7 days expiry)
   ↓
3. Frontend/Extension stores tokens:
   - Dashboard: localStorage
   - Extension: chrome.storage.local
   ↓
4. All API requests include:
   Authorization: Bearer {accessToken}
   ↓
5. Token expires → Auto-refresh with refreshToken
   ↓
6. Refresh token expires → User must login again
```

---

## 🗄️ Database Schema

Key tables:

```
users
├─ id, email, password, name
├─ createdAt, updatedAt
└─ Relations: scripts, testRuns, testDataFiles

scripts
├─ id, name, code, language
├─ userId, projectId
├─ browserType, viewport, testIdAttribute
└─ selfHealingEnabled

testRuns
├─ id, scriptId, userId
├─ status, duration, errorMsg
├─ startedAt, completedAt
└─ Relations: testSteps

testDataFiles
├─ id, name, fileName, fileType
├─ userId, scriptId
├─ rowCount, columnNames
└─ Relations: testDataRows

selfHealingLocators
├─ id, scriptId
├─ brokenLocator, validLocator
├─ confidence, status
└─ timesUsed, lastUsedAt
```

View full schema: `backend/prisma/schema.prisma`

---

## 🔧 Configuration

### **Backend (.env)**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/playwright_crx"
JWT_ACCESS_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="another-secret-key-min-32-chars"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173,chrome-extension://*"
```

### **Frontend (vite.config.ts)**
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': 'http://localhost:3000',
    '/ws': 'ws://localhost:3000'
  }
}
```

### **Extension (apiService.ts)**
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
const WS_URL = 'ws://localhost:3000/ws';
```

---

## 🧪 Testing the Integration

### **1. Backend Health Check**
```bash
curl http://localhost:3000/api/health

# Response:
# {"status":"ok","timestamp":"2025-01-15T10:30:00.000Z"}
```

### **2. Register User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

### **3. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Save the accessToken from response
```

### **4. Test Authenticated Endpoint**
```bash
curl http://localhost:3000/api/scripts \
  -H "Authorization: Bearer {your-access-token}"
```

---

## 🚨 Troubleshooting

### **Database Connection Error**
```
Error: Can't reach database server
```
**Solution:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check firewall settings

### **Port Already in Use**
```
Error: Port 3000 already in use
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### **CORS Error in Frontend**
```
Access to fetch blocked by CORS policy
```
**Solution:**
- Add frontend URL to CORS_ORIGIN in backend .env
- Restart backend

### **Extension Can't Connect**
```
Failed to load saved scripts
```
**Solution:**
- Check backend is running
- Verify API_BASE_URL in apiService.ts
- Login via extension UI

---

## 📊 Monitoring

### **View Database**
```bash
cd backend
npm run prisma:studio

# Opens GUI at http://localhost:5555
```

### **View Logs**
```bash
# Backend logs
cd backend
tail -f logs/combined.log

# Frontend logs
# Check browser console (F12)
```

### **API Documentation**
Visit: http://localhost:3000/api-docs (Swagger UI)

---

## 🎉 Success Criteria

✅ Backend running on port 3000
✅ Frontend running on port 5173
✅ Database connected
✅ Can register/login
✅ Extension connects to backend
✅ Can save scripts from extension
✅ Can view scripts in dashboard
✅ Can execute tests
✅ Real-time updates via WebSocket

---

## 📚 Next Steps

1. **Explore Dashboard** - Browse UI features
2. **Record Tests** - Use extension to create tests
3. **Upload Data** - Try data-driven testing
4. **Review Analytics** - Check execution metrics
5. **Configure Self-Healing** - Test locator recovery

---

## 🔗 Quick Links

- **Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api-docs
- **Database GUI**: http://localhost:5555 (Prisma Studio)

---

**You now have a complete full-stack Playwright testing platform!** 🎭✨
