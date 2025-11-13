# 🗄️ PostgreSQL Database Setup Guide

## 📋 Current Status

❌ **PostgreSQL NOT installed** on your system
❌ **Database NOT created**
❌ **Migrations NOT run**

---

## 🚀 Complete Setup Instructions

### **Step 1: Install PostgreSQL** (Choose ONE method)

#### **Method A: Official Installer (Recommended for Windows)**

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Choose PostgreSQL 15 or 16
   - Download for Windows x86-64

2. **Run Installer:**
   ```
   Double-click downloaded .exe
   → Click "Next"
   → Installation Directory: C:\Program Files\PostgreSQL\15
   → Components: Select ALL (Server, pgAdmin 4, Stack Builder, Command Line Tools)
   → Data Directory: C:\Program Files\PostgreSQL\15\data
   → Password: Enter a strong password (REMEMBER THIS!)
   → Port: 5432 (default)
   → Locale: Default
   → Click "Next" → "Next" → Install
   ```

3. **Verify Installation:**
   ```powershell
   # Close and reopen PowerShell/Terminal
   psql --version
   # Should output: psql (PostgreSQL) 15.x
   ```

#### **Method B: Docker (If you have Docker)**

```powershell
# Pull and run PostgreSQL in Docker
docker run --name playwright-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=playwright_crx `
  -p 5432:5432 `
  -d postgres:15

# Verify
docker ps
```

#### **Method C: Chocolatey**

```powershell
# Run as Administrator
choco install postgresql15 -y

# Add to PATH manually if needed
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"
```

---

### **Step 2: Automated Setup (Easiest)**

Once PostgreSQL is installed, run the automated setup script:

```powershell
# From project root
.\setup-database.ps1
```

This script will:
- ✅ Create database `playwright_crx`
- ✅ Create user `playwright_user`
- ✅ Install backend dependencies
- ✅ Generate Prisma client
- ✅ Run migrations
- ✅ Optionally seed test data

---

### **Step 3: Manual Setup (Alternative)**

If you prefer manual setup:

#### **3.1: Create Database**

```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE playwright_crx;
CREATE USER playwright_user WITH PASSWORD 'playwright123';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO playwright_user;
\q
```

#### **3.2: Configure Backend**

The `.env` file is already created with default settings:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/playwright_crx?schema=public"
```

**If you used a different password**, edit `.env`:

```powershell
# Edit this file:
code playwright-crx-enhanced\backend\.env

# Change the DATABASE_URL:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/playwright_crx?schema=public"
```

#### **3.3: Install Dependencies**

```powershell
cd playwright-crx-enhanced\backend
npm install
```

#### **3.4: Generate Prisma Client**

```powershell
npm run prisma:generate
```

#### **3.5: Run Migrations**

```powershell
npm run prisma:migrate
```

#### **3.6: Seed Database (Optional)**

```powershell
npm run prisma:seed
```

---

## ✅ Verify Setup

### **Test Database Connection**

```powershell
# Connect to database
psql -U postgres -d playwright_crx

# List tables
\dt

# Should show:
# - users
# - refreshtokens
# - projects
# - scripts
# - testruns
# - etc.

# Exit
\q
```

### **Test Backend**

```powershell
cd playwright-crx-enhanced\backend
npm run dev

# Should see:
# Server running on http://localhost:3000
# Database connected successfully
```

### **Test API**

```powershell
# In another terminal
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"..."}
```

---

## 🗺️ Database Schema Overview

The database includes these main tables:

```
users
├─ id (Primary Key)
├─ email (Unique)
├─ password (Hashed)
├─ name
└─ timestamps

scripts
├─ id
├─ name
├─ code (Test code)
├─ language (typescript, python, java, etc.)
├─ userId (Foreign Key)
└─ metadata (browser, viewport, etc.)

testRuns
├─ id
├─ scriptId
├─ status (running, passed, failed)
├─ duration
└─ results

selfHealingLocators
├─ id
├─ scriptId
├─ brokenLocator
├─ validLocator
├─ confidence
└─ status (pending, approved, rejected)

testDataFiles
├─ id
├─ name
├─ fileType (csv, json)
├─ data
└─ userId
```

Full schema: `playwright-crx-enhanced/backend/prisma/schema.prisma`

---

## 🔧 Common Issues & Solutions

### **Issue: `psql` command not found**

**Solution:**
```powershell
# Add PostgreSQL to PATH
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Make it permanent:
[Environment]::SetEnvironmentVariable(
    "Path",
    $env:Path + ";C:\Program Files\PostgreSQL\15\bin",
    [EnvironmentVariableTarget]::User
)

# Restart terminal
```

### **Issue: Password authentication failed**

**Solution:**
1. Edit `.env` with correct password
2. Or reset PostgreSQL password:
   ```powershell
   # Run as Administrator
   psql -U postgres
   ALTER USER postgres PASSWORD 'newpassword';
   ```

### **Issue: Port 5432 already in use**

**Solution:**
```powershell
# Find what's using port 5432
netstat -ano | findstr :5432

# Kill the process
taskkill /PID <PID> /F
```

### **Issue: Connection refused**

**Solution:**
```powershell
# Check if PostgreSQL service is running
Get-Service -Name postgresql*

# Start if stopped
Start-Service postgresql-x64-15
```

### **Issue: Prisma migration failed**

**Solution:**
```powershell
# Reset database
cd playwright-crx-enhanced\backend
npm run prisma:migrate -- reset

# Re-run migrations
npm run prisma:migrate
```

---

## 📊 Database Management Tools

### **pgAdmin 4 (Included with PostgreSQL)**

```
1. Open pgAdmin 4 from Start Menu
2. Connect to localhost
3. Browse: Servers → PostgreSQL 15 → Databases → playwright_crx
4. View tables, run queries, manage data
```

### **Prisma Studio (Recommended)**

```powershell
cd playwright-crx-enhanced\backend
npm run prisma:studio

# Opens GUI at http://localhost:5555
```

### **DBeaver (Free Universal DB Tool)**

Download: https://dbeaver.io/download/

---

## 🧪 Test Data

After running `npm run prisma:seed`, you'll have:

**Test User:**
- Email: `test@example.com`
- Password: `Test123!@#`

**Sample Scripts:**
- Login test (TypeScript)
- Form validation test (Python)
- Checkout flow test (Java)

**Sample Data Files:**
- users.csv (3 test users)
- products.json (5 products)

---

## 🎯 Next Steps

After database setup is complete:

1. **Start Backend:**
   ```powershell
   cd playwright-crx-enhanced\backend
   npm run dev
   ```

2. **Start Frontend:**
   ```powershell
   cd playwright-crx-enhanced\frontend
   npm install
   npm run dev
   ```

3. **Access Dashboard:**
   - Open: http://localhost:5173
   - Login with test@example.com / Test123!@#

4. **Use Extension:**
   - Load extension from `examples/recorder-crx/dist`
   - Login with same credentials
   - Start recording!

---

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [SQL Tutorial](https://www.postgresql.org/docs/tutorial/)

---

**Need Help?**

If you encounter any issues:
1. Check the error message
2. Look in this troubleshooting section
3. Check backend logs: `playwright-crx-enhanced/backend/logs/`
4. Run `npm run prisma:studio` to inspect database directly

---

**Once PostgreSQL is installed, run:**
```powershell
.\setup-database.ps1
```

**This will set up everything automatically!** 🚀
