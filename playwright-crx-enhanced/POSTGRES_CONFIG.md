# 🗄️ PostgreSQL Configuration Guide

## 📋 Environment Variables

The `.env` file now has separate PostgreSQL parameters for easy configuration:

```env
# PostgreSQL Connection Parameters
DB_HOST=localhost          # Database server address
DB_PORT=5432              # PostgreSQL port (default: 5432)
DB_NAME=playwright_crx    # Your database name
DB_USER=postgres          # PostgreSQL username
DB_PASSWORD=postgres      # PostgreSQL password
DB_SCHEMA=public          # Database schema (usually 'public')
```

---

## 🔧 How to Configure

### **Step 1: Edit `.env` File**

```bash
# Open the file
code playwright-crx-enhanced/backend/.env
```

### **Step 2: Update Parameters**

Replace these values with your PostgreSQL credentials:

```env
# Example for local PostgreSQL installation:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx        # ← Your database name
DB_USER=postgres              # ← Your PostgreSQL username
DB_PASSWORD=YourPassword123   # ← Your PostgreSQL password
DB_SCHEMA=public
```

### **Step 3: Save and Restart**

The `DATABASE_URL` will be automatically generated from these parameters:

```
postgresql://postgres:YourPassword123@localhost:5432/playwright_crx?schema=public
```

---

## 📝 Common Configurations

### **Configuration 1: Default PostgreSQL**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=postgres
DB_PASSWORD=postgres    # ← Change this to your password
DB_SCHEMA=public
```

### **Configuration 2: Custom User**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=playwright_user        # ← Custom user
DB_PASSWORD=secure_password    # ← Custom password
DB_SCHEMA=public
```

### **Configuration 3: Remote Database**
```env
DB_HOST=192.168.1.100          # ← Remote server IP
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=remote_user
DB_PASSWORD=remote_password
DB_SCHEMA=public
```

### **Configuration 4: Docker PostgreSQL**
```env
DB_HOST=localhost              # or 'host.docker.internal' from within Docker
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=postgres
DB_PASSWORD=postgres
DB_SCHEMA=public
```

### **Configuration 5: Cloud Database (e.g., AWS RDS)**
```env
DB_HOST=mydb.abc123.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=admin
DB_PASSWORD=MySecureCloudPassword123!
DB_SCHEMA=public
```

---

## 🚀 Quick Setup Examples

### **Example 1: Fresh PostgreSQL Installation**

```env
# After installing PostgreSQL with password "MyPassword123"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=postgres
DB_PASSWORD=MyPassword123
DB_SCHEMA=public
```

Then create the database:
```sql
psql -U postgres
CREATE DATABASE playwright_crx;
\q
```

### **Example 2: Using Different Database Name**

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_test_database      # ← Different name
DB_USER=postgres
DB_PASSWORD=postgres
DB_SCHEMA=public
```

Create it:
```sql
psql -U postgres
CREATE DATABASE my_test_database;
\q
```

### **Example 3: Separate Test Database**

**Development (.env.development):**
```env
DB_NAME=playwright_crx_dev
DB_USER=dev_user
DB_PASSWORD=dev_password
```

**Testing (.env.test):**
```env
DB_NAME=playwright_crx_test
DB_USER=test_user
DB_PASSWORD=test_password
```

**Production (.env.production):**
```env
DB_NAME=playwright_crx_prod
DB_USER=prod_user
DB_PASSWORD=strong_prod_password
```

---

## 🔐 Security Best Practices

### **1. Never Commit Real Credentials**

```bash
# .gitignore should include:
.env
.env.local
.env.*.local
```

### **2. Use Strong Passwords**

❌ **Bad:** `DB_PASSWORD=password`
❌ **Bad:** `DB_PASSWORD=123456`
✅ **Good:** `DB_PASSWORD=Str0ng!P@ssw0rd#2024`

### **3. Different Passwords Per Environment**

- Development: Simple password for local testing
- Testing: Different password
- Production: Very strong, unique password

### **4. Use Environment-Specific Files**

```
.env.development    # Local development
.env.test          # Testing
.env.production    # Production (never commit!)
```

---

## ✅ Verification Steps

### **Step 1: Test Connection**

```powershell
# Test if you can connect with your credentials
psql -h localhost -p 5432 -U postgres -d playwright_crx

# Enter your password when prompted
# If successful, you'll see: playwright_crx=#
```

### **Step 2: Verify .env Loading**

```powershell
cd playwright-crx-enhanced/backend

# Start backend
npm run dev

# Look for: "✅ Database connected successfully"
```

### **Step 3: Test with Prisma**

```powershell
# Generate Prisma client
npm run prisma:generate

# Test database connection
npm run prisma:studio

# Opens GUI at http://localhost:5555
```

---

## 🐛 Troubleshooting

### **Error: "password authentication failed"**

**Cause:** Wrong password in .env
**Solution:**
```env
# Double-check your password
DB_PASSWORD=YourActualPassword
```

### **Error: "database does not exist"**

**Cause:** Database not created
**Solution:**
```sql
psql -U postgres
CREATE DATABASE playwright_crx;
\q
```

### **Error: "connection refused"**

**Cause:** PostgreSQL not running or wrong host/port
**Solution:**
```powershell
# Check PostgreSQL status
Get-Service postgresql*

# Start if stopped
Start-Service postgresql-x64-15

# Verify host/port in .env
DB_HOST=localhost  # Not 127.0.0.1 if there are issues
DB_PORT=5432       # Check your actual port
```

### **Error: "role does not exist"**

**Cause:** User doesn't exist
**Solution:**
```sql
psql -U postgres
CREATE USER your_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO your_user;
\q
```

---

## 📊 Database URL Format Reference

The `DATABASE_URL` is automatically built from your parameters:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=[SCHEMA]
```

**Example Breakdown:**
```
postgresql://postgres:MyPass123@localhost:5432/playwright_crx?schema=public
           │          │          │         │      │               │
           │          │          │         │      │               └─ Schema
           │          │          │         │      └───────────────── Database name
           │          │          │         └──────────────────────── Port
           │          │          └────────────────────────────────── Host
           │          └───────────────────────────────────────────── Password
           └──────────────────────────────────────────────────────── Username
```

---

## 🎯 Quick Reference Table

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `DB_HOST` | Database server | `localhost` | `192.168.1.100` |
| `DB_PORT` | PostgreSQL port | `5432` | `5433` |
| `DB_NAME` | Database name | `playwright_crx` | `my_database` |
| `DB_USER` | Username | `postgres` | `admin` |
| `DB_PASSWORD` | Password | `postgres` | `SecurePass123!` |
| `DB_SCHEMA` | Schema | `public` | `custom_schema` |

---

## 📁 File Locations

```
playwright-crx-enhanced/backend/
├── .env                    # ← Your actual credentials (not committed)
├── .env.example           # ← Template with documentation
└── prisma/
    └── schema.prisma      # ← Database schema definition
```

---

## 🚀 Complete Setup Workflow

```powershell
# 1. Install PostgreSQL
# Download from: https://www.postgresql.org/download/windows/

# 2. Create database
psql -U postgres
CREATE DATABASE playwright_crx;
\q

# 3. Configure .env
code playwright-crx-enhanced/backend/.env
# Update DB_PASSWORD with your PostgreSQL password

# 4. Install dependencies
cd playwright-crx-enhanced/backend
npm install

# 5. Run migrations
npm run prisma:migrate

# 6. Start backend
npm run dev

# ✅ Done! Backend running with your database
```

---

## 💡 Pro Tips

### **Tip 1: Use .env for Local, Environment Variables for Production**

```bash
# Local (use .env file)
DB_PASSWORD=local_password

# Production (use system environment variables)
export DB_PASSWORD="production_password"
```

### **Tip 2: Keep .env.example Updated**

When adding new DB parameters, update both:
- `.env` (your actual config)
- `.env.example` (template for others)

### **Tip 3: Database Connection Pooling**

For production, add to `.env`:
```env
DB_CONNECTION_POOL_MIN=2
DB_CONNECTION_POOL_MAX=10
```

### **Tip 4: SSL for Production**

For remote/production databases:
```env
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false  # Only for development!
```

---

**Now you can easily configure your PostgreSQL database by editing the `.env` file!** 🎉

**Just update these 6 parameters:**
1. ✅ `DB_HOST` - Usually `localhost`
2. ✅ `DB_PORT` - Usually `5432`
3. ✅ `DB_NAME` - Your database name
4. ✅ `DB_USER` - Your PostgreSQL username
5. ✅ `DB_PASSWORD` - **Your PostgreSQL password**
6. ✅ `DB_SCHEMA` - Usually `public`

The `DATABASE_URL` will be automatically generated! 🚀
