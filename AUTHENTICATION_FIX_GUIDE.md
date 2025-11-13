# 🔧 Authentication Fix Guide

## 🎯 Overview
This guide addresses common authentication issues when creating users in the Playwright CRX extension.

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend Server Not Running
**Problem**: Extension can't connect to the backend API.

**Solution**:
```bash
# Navigate to backend directory
cd playwright-crx-enhanced/backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start the server
npm run dev
```

**Expected Output**: Server running on http://localhost:3000

---

### Issue 2: Database Connection Problems
**Problem**: Backend can't connect to PostgreSQL database.

**Solution**:
1. **Install PostgreSQL** (if not installed):
   ```bash
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   brew services start postgresql
   ```

2. **Create Database**:
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- Create database
   CREATE DATABASE playwright_crx;
   
   -- Create user (optional)
   CREATE USER crx_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
   ```

3. **Update .env Configuration**:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=playwright_crx
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   DATABASE_URL="postgresql://postgres:your_actual_password@localhost:5432/playwright_crx"
   ```

---

### Issue 3: CORS Configuration
**Problem**: Extension blocked by CORS policy.

**Solution**: Update backend CORS settings in `playwright-crx-enhanced/backend/src/index.ts`:

```typescript
// Add this to your server configuration
app.use(cors({
  origin: [
    'chrome-extension://*',  // Allow all Chrome extensions
    'http://localhost:3000',
    'http://localhost:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Issue 4: Extension ID Configuration
**Problem**: Extension ID not properly configured.

**Solution**:
1. **Get Extension ID**:
   - Open Chrome Extensions page (`chrome://extensions/`)
   - Enable "Developer mode"
   - Find your extension ID (32-character string)

2. **Update .env**:
   ```env
   ALLOWED_ORIGINS="chrome-extension://YOUR_EXTENSION_ID_HERE,http://localhost:3000"
   ```

---

### Issue 5: Token Storage Issues
**Problem**: Chrome extension storage not working.

**Solution**: Add storage permissions to `manifest.json`:

```json
{
  "name": "Playwright CRX",
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "http://localhost:3000/*"
  ]
}
```

---

## 🔧 Complete Fix Checklist

### Backend Setup
- [ ] PostgreSQL installed and running
- [ ] Database `playwright_crx` created
- [ ] `.env` file configured with correct database credentials
- [ ] Database migrations applied (`npx prisma migrate dev`)
- [ ] Backend server running (`npm run dev`)
- [ ] CORS properly configured

### Extension Setup
- [ ] Extension ID added to `.env` ALLOWED_ORIGINS
- [ ] Storage permissions in manifest.json
- [ ] API_BASE_URL correctly set to `http://localhost:3000/api`

### Testing
- [ ] Backend accessible at http://localhost:3000
- [ ] Extension can register new users
- [ ] Extension can login existing users
- [ ] Tokens persist across extension reloads

---

## 🧪 Testing Authentication

### 1. Test Backend API
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 2. Test Extension
1. Open Chrome DevTools Console
2. Try to register a new user
3. Check for errors in Network tab
4. Verify tokens in Chrome storage:
   ```javascript
   // In DevTools Console
   chrome.storage.local.get(['auth_tokens'], console.log);
   ```

---

## 🐛 Common Error Messages & Solutions

### "Failed to fetch"
**Cause**: Backend not running or CORS blocked
**Fix**: Start backend server and configure CORS

### "Invalid credentials"
**Cause**: Wrong email/password or user doesn't exist
**Fix**: Check database for user or register new account

### "Unauthorized"
**Cause**: Token expired or invalid
**Fix**: Clear extension storage and login again

### "Database connection failed"
**Cause**: PostgreSQL not running or wrong credentials
**Fix**: Start PostgreSQL and update .env

---

## 🔄 Debugging Steps

### 1. Check Backend Logs
```bash
cd playwright-crx-enhanced/backend
npm run dev
# Watch for error messages
```

### 2. Check Extension Console
1. Right-click extension popup → Inspect
2. Check Console tab for errors
3. Check Network tab for failed requests

### 3. Verify Database Connection
```bash
# Test database connection
psql -U postgres -h localhost -d playwright_crx
# If successful, you'll see: playwright_crx=#
```

---

## 📋 Quick Fix Script

Create a script to automate the fix process:

```bash
#!/bin/bash
# auth-fix.sh

echo "🔧 Fixing Playwright CRX Authentication..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running"
    echo "Please start PostgreSQL service"
    exit 1
fi

# Navigate to backend
cd playwright-crx-enhanced/backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev

# Start server
echo "🚀 Starting backend server..."
npm run dev
```

---

## 🎯 Final Verification

After applying these fixes:

1. **Backend should be running** on http://localhost:3000
2. **Database should be accessible** with proper credentials
3. **Extension should register** new users successfully
4. **Tokens should persist** in Chrome storage
5. **Login should work** for registered users

If issues persist, check:
- Browser console for JavaScript errors
- Network tab for failed API requests
- Backend logs for database errors
- Extension permissions in Chrome

---

**Last Updated**: 2025-10-24
**Version**: 1.0.0