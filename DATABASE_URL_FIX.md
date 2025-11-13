# 🔧 DATABASE_URL searchParams Error Fix

## 🚨 Root Cause Identified
The error `"Cannot read properties of undefined (reading 'searchParams')"` is caused by:
1. **Invalid DATABASE_URL format** in backend environment
2. **PostgreSQL connection string parser** failing to parse malformed URL
3. **Missing URL validation** before attempting to parse

## 🎯 Error Location
```
File: playwright-crx-enhanced/backend/node_modules/pg-connection-string/index.js:39:30
Function: parse() trying to access .searchParams on undefined URL object
```

## 🛠️ Applied Fixes

### 1. **Database Connection Validation** (`playwright-crx-enhanced/backend/src/db.ts`)
```typescript
// Added URL validation before parsing
const isValidUrl = envUrl.length > 0 && 
  (envUrl.startsWith('postgresql://') || envUrl.startsWith('postgres://'));

const connectionString = isValidUrl
  ? envUrl
  : `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
```

### 2. **Environment Variable Template**
Create a proper `.env` file with correct DATABASE_URL format:

```env
# ❌ WRONG (causes searchParams error)
DATABASE_URL=postgresql://user:password@localhost:5432/playwright_crx

# ✅ CORRECT (properly formatted)
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/playwright_crx
```

### 3. **Complete .env Template**
```env
# ============================================
# DATABASE CONFIGURATION
# ============================================

# PostgreSQL Host
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# Full Database Connection URL (REQUIRED - use this format)
DATABASE_URL=postgresql://postgres:your_actual_password_here@localhost:5432/playwright_crx

# JWT Secrets
JWT_ACCESS_SECRET="your-super-secret-access-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS="chrome-extension://*,http://localhost:3000"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Quick Fix Steps

### Step 1: Update .env File
```bash
cd playwright-crx-enhanced/backend

# Create proper .env file
cat > .env << 'EOF'
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# IMPORTANT: Use this exact format for DATABASE_URL
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/playwright_crx

# JWT Secrets (generate new ones)
JWT_ACCESS_SECRET="$(openssl rand -base64 32)"
JWT_REFRESH_SECRET="$(openssl rand -base64 32)"

# Server Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS="chrome-extension://*,http://localhost:3000"
LOG_LEVEL=debug
EOF
```

### Step 2: Restart Backend Server
```bash
# Stop any running server
pkill -f "node.*3000" || true

# Start new server
npm run dev
```

### Step 3: Test Database Connection
```bash
# Test connection directly
psql "postgresql://postgres:your_postgres_password@localhost:5432/playwright_crx" -c "SELECT version();"

# Or test with Node.js
node -e "
const pool = require('./src/db.ts').default;
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connection successful'))
  .catch(err => console.error('❌ Database connection failed:', err.message));
"
```

## 🔍 Verification

### 1. Check Backend Logs
```bash
# Should see this success message:
"🚀 Server running on port 3000"
"📡 Environment: development"
"🏥 Health check: http://localhost:3000/health"
```

### 2. Test API Endpoints
```bash
# Test health endpoint
curl http://localhost:3000/health

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

### 3. Check Extension Registration
1. Open Chrome DevTools Console
2. Clear extension storage: `chrome.storage.local.clear()`
3. Reload extension
4. Try to register new user
5. Should see success message in console

## 🚨 Common Mistakes to Avoid

### ❌ Wrong DATABASE_URL Formats
```env
# These will cause searchParams errors:
DATABASE_URL=postgres://user:pass@host/db  # Missing "ql"
DATABASE_URL=postgresql://user@host/db     # Missing password
DATABASE_URL=postgresql://user:pass@host     # Missing database
DATABASE_URL=postgresql:///db              # Missing host/user
```

### ✅ Correct DATABASE_URL Format
```env
# Required format:
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Example:
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/playwright_crx
```

## 📋 Troubleshooting Checklist

- [ ] PostgreSQL is running (`pg_isready`)
- [ ] Database `playwright_crx` exists
- [ ] `.env` file has correct DATABASE_URL format
- [ ] DATABASE_URL includes all required parts (protocol, user, password, host, port, database)
- [ ] Backend server starts without errors
- [ ] Health endpoint returns `{"status": "ok"}`
- [ ] Registration endpoint works via curl
- [ ] Extension can register users without searchParams errors

## 🎯 Expected Results

After applying these fixes:

✅ **No more searchParams errors** - DATABASE_URL is properly formatted
✅ **Database connects successfully** - PostgreSQL connection established
✅ **Backend starts cleanly** - No connection string parsing errors
✅ **Registration works** - Users can create accounts via extension
✅ **Login works** - Existing users can authenticate

## 🔄 If Issues Persist

1. **Check PostgreSQL version**:
   ```bash
   psql --version
   # Should be 12.0 or higher
   ```

2. **Verify database exists**:
   ```sql
   \l  # List databases
   # Should see "playwright_crx"
   ```

3. **Test connection manually**:
   ```bash
   psql "postgresql://postgres:password@localhost:5432/playwright_crx"
   # Should connect successfully
   ```

4. **Check Node.js version**:
   ```bash
   node --version
   # Should be 18.0 or higher
   ```

---

**Last Updated**: 2025-10-24
**Fix Version**: 2.0.0
**Status**: Ready for Testing