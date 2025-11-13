# 🚀 Complete Deployment Guide for Playwright CRX

This guide covers the complete process of preparing, building, and deploying the Playwright CRX extension with backend to different environments, including GitHub push and Red Hat/HSBC deployment.

## 📋 Table of Contents

1. [Preparation for GitHub Push](#preparation-for-github-push)
2. [Database Backup and Migration](#database-backup-and-migration)
3. [Cross-Platform Build Process](#cross-platform-build-process)
4. [Red Hat/HSBC Environment Setup](#red-hathsbc-environment-setup)
5. [Testing and Verification](#testing-and-verification)
6. [Troubleshooting](#troubleshooting)

---

## 🔒 Preparation for GitHub Push

### 1. Security Check

Before pushing to GitHub, ensure no sensitive data is committed:

```bash
# Check if .env files are properly ignored
git status --ignored | grep .env

# Verify no actual passwords in code
grep -r "password\|secret\|key" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
```

### 2. Required Files Check

Ensure these files exist and are properly configured:

- `.gitignore` - Should exclude `.env`, `node_modules/`, `dist/`
- `playwright-crx-enhanced/backend/.env.example` - Template for environment variables
- `examples/recorder-crx/.gitignore` - Should allow `dist/` for distribution
- `README.md` - Clear setup instructions
- `LICENSE` - Appropriate license file

### 3. Pre-push Checklist

```bash
# 1. Test extension build
./build-extension.sh  # Linux/Mac
# or
build-extension.bat  # Windows

# 2. Test backend build
cd playwright-crx-enhanced/backend
npm run build

# 3. Run tests (if available)
npm test

# 4. Check for linting errors
npm run lint
```

---

## 💾 Database Backup and Migration

### 1. Database Backup Script

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash

# Database Backup Script for Playwright CRX
# This script creates a complete backup of the playwright_crx database

set -e

# Load environment variables
if [ -f "playwright-crx-enhanced/backend/.env" ]; then
    export $(grep -v '^#' playwright-crx-enhanced/backend/.env | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Create backup directory
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/playwright_crx_backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "🔒 Creating database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "Backup file: $BACKUP_FILE"

# Create backup
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo "✅ Backup created successfully: $BACKUP_FILE"
echo "File size: $(du -h $BACKUP_FILE | cut -f1)"

# Create backup metadata
cat > "${BACKUP_FILE}.meta" << EOF
Backup Information:
==================
Database: $DB_NAME
Host: $DB_HOST:$DB_PORT
Created: $(date)
Size: $(du -h $BACKUP_FILE | cut -f1)
Version: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
EOF

echo "📄 Metadata file created: ${BACKUP_FILE}.meta"
```

### 2. Database Restore Script

Create `scripts/restore-database.sh`:

```bash
#!/bin/bash

# Database Restore Script for Playwright CRX
# This script restores a database from backup

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 backups/playwright_crx_backup_20240101_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
if [ -f "playwright-crx-enhanced/backend/.env" ]; then
    export $(grep -v '^#' playwright-crx-enhanced/backend/.env | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

echo "🔄 Restoring database from backup..."
echo "Backup file: $BACKUP_FILE"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"

# Extract and restore
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
else
    psql "$DATABASE_URL" < "$BACKUP_FILE"
fi

echo "✅ Database restored successfully"

# Run migrations to ensure schema is up to date
cd playwright-crx-enhanced/backend
npx prisma migrate deploy

echo "🔄 Database migrations applied"
```

### 3. Database Migration Script for Red Hat

Create `scripts/migrate-to-redhat.sh`:

```bash
#!/bin/bash

# Complete Database Migration Script for Red Hat Environment
# This script handles the entire migration process

set -e

SOURCE_ENV="local"
TARGET_ENV="redhat"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Starting database migration from $SOURCE_ENV to $TARGET_ENV"
echo "Timestamp: $TIMESTAMP"

# 1. Create backup on source
echo "📦 Step 1: Creating backup on source environment..."
./scripts/backup-database.sh

# Find the latest backup
LATEST_BACKUP=$(ls -t $BACKUP_DIR/playwright_crx_backup_*.sql.gz | head -1)
echo "Latest backup: $LATEST_BACKUP"

# 2. Transfer to target (example - adjust for your setup)
echo "📤 Step 2: Transferring backup to target environment..."
# scp "$LATEST_BACKUP" user@redhat-server:/path/to/backups/
echo "Note: Manually transfer $LATEST_BACKUP to Red Hat server"

# 3. Instructions for target environment
echo "📋 Step 3: On Red Hat server, run these commands:"
echo ""
echo "# 1. Extract backup"
echo "gunzip $LATEST_BACKUP"
echo ""
echo "# 2. Restore database"
echo "psql -h localhost -U crx_user -d playwright_crx < ${LATEST_BACKUP%.gz}"
echo ""
echo "# 3. Run migrations"
echo "cd /path/to/playwright-crx-enhanced/backend"
echo "npx prisma migrate deploy"
echo ""

echo "✅ Migration instructions prepared"
```

---

## 🔨 Cross-Platform Build Process

### 1. Universal Build Script

Create `scripts/build-all.sh`:

```bash
#!/bin/bash

# Universal Build Script for Playwright CRX
# Works on Linux, macOS, and Windows (via Git Bash/WSL)

set -e

echo "🏗️  Starting complete build process..."

# 1. Build Extension
echo "📦 Building Chrome Extension..."
if command -v npm &> /dev/null; then
    cd examples/recorder-crx
    npm install
    npm run build
    cd ../..
    echo "✅ Extension build completed"
else
    echo "❌ npm not found. Please install Node.js"
    exit 1
fi

# 2. Build Backend
echo "🔧 Building Backend..."
if [ -d "playwright-crx-enhanced/backend" ]; then
    cd playwright-crx-enhanced/backend
    npm install
    npm run build
    cd ../..
    echo "✅ Backend build completed"
else
    echo "❌ Backend directory not found"
    exit 1
fi

# 3. Create Distribution Package
echo "📦 Creating distribution package..."
DIST_DIR="./dist/playwright-crx-$(date +%Y%m%d)"
mkdir -p "$DIST_DIR"

# Copy extension
cp -r examples/recorder-crx/dist "$DIST_DIR/extension"

# Copy backend
cp -r playwright-crx-enhanced/backend/dist "$DIST_DIR/backend"
cp playwright-crx-enhanced/backend/package.json "$DIST_DIR/backend/"
cp playwright-crx-enhanced/backend/.env.example "$DIST_DIR/backend/.env.example"

# Copy documentation
cp README.md "$DIST_DIR/"
cp DEPLOYMENT_GUIDE.md "$DIST_DIR/"

# Create setup script
cat > "$DIST_DIR/setup.sh" << 'EOF'
#!/bin/bash
echo "🚀 Setting up Playwright CRX..."
echo "1. Install backend dependencies"
cd backend
npm install --production
echo "2. Configure environment"
cp .env.example .env
echo "3. Update .env with your database credentials"
echo "4. Run database migrations"
npx prisma migrate deploy
echo "5. Start backend"
npm start
EOF

chmod +x "$DIST_DIR/setup.sh"

# Create Windows setup script
cat > "$DIST_DIR/setup.bat" << 'EOF'
@echo off
echo 🚀 Setting up Playwright CRX...
echo 1. Install backend dependencies
cd backend
npm install --production
echo 2. Configure environment
copy .env.example .env
echo 3. Update .env with your database credentials
echo 4. Run database migrations
npx prisma migrate deploy
echo 5. Start backend
npm start
EOF

# Create archive
cd dist
tar -czf "playwright-crx-$(date +%Y%m%d).tar.gz" "playwright-crx-$(date +%Y%m%d)"
cd ..

echo "✅ Build completed successfully!"
echo "📦 Distribution package: $DIST_DIR"
echo "📦 Archive: dist/playwright-crx-$(date +%Y%m%d).tar.gz"
```

### 2. Windows Build Script

Create `scripts/build-all.bat`:

```batch
@echo off
REM Universal Build Script for Playwright CRX (Windows)

echo 🏗️  Starting complete build process...

REM 1. Build Extension
echo 📦 Building Chrome Extension...
cd examples\recorder-crx
if exist node_modules (
    echo Dependencies already installed
) else (
    npm install
)
npm run build
if exist dist (
    echo ✅ Extension build completed
) else (
    echo ❌ Extension build failed
    exit /b 1
)
cd ..\..

REM 2. Build Backend
echo 🔧 Building Backend...
if exist playwright-crx-enhanced\backend (
    cd playwright-crx-enhanced\backend
    if exist node_modules (
        echo Dependencies already installed
    ) else (
        npm install
    )
    npm run build
    if exist dist (
        echo ✅ Backend build completed
    ) else (
        echo ❌ Backend build failed
        exit /b 1
    )
    cd ..\..
) else (
    echo ❌ Backend directory not found
    exit /b 1
)

REM 3. Create Distribution Package
echo 📦 Creating distribution package...
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%
set DIST_DIR=.\dist\playwright-crx-%TIMESTAMP%
mkdir "%DIST_DIR%"

REM Copy extension
xcopy /E /I examples\recorder-crx\dist "%DIST_DIR%\extension"

REM Copy backend
xcopy /E /I playwright-crx-enhanced\backend\dist "%DIST_DIR%\backend"
copy playwright-crx-enhanced\backend\package.json "%DIST_DIR%\backend\"
copy playwright-crx-enhanced\backend\.env.example "%DIST_DIR%\backend\.env.example"

REM Copy documentation
copy README.md "%DIST_DIR%\"
copy DEPLOYMENT_GUIDE.md "%DIST_DIR%\"

REM Create setup script
echo @echo off > "%DIST_DIR%\setup.bat"
echo echo 🚀 Setting up Playwright CRX... >> "%DIST_DIR%\setup.bat"
echo echo 1. Install backend dependencies >> "%DIST_DIR%\setup.bat"
echo cd backend >> "%DIST_DIR%\setup.bat"
echo npm install --production >> "%DIST_DIR%\setup.bat"
echo echo 2. Configure environment >> "%DIST_DIR%\setup.bat"
echo copy .env.example .env >> "%DIST_DIR%\setup.bat"
echo echo 3. Update .env with your database credentials >> "%DIST_DIR%\setup.bat"
echo echo 4. Run database migrations >> "%DIST_DIR%\setup.bat"
echo npx prisma migrate deploy >> "%DIST_DIR%\setup.bat"
echo echo 5. Start backend >> "%DIST_DIR%\setup.bat"
echo npm start >> "%DIST_DIR%\setup.bat"

echo ✅ Build completed successfully!
echo 📦 Distribution package: %DIST_DIR%
```

---

## 🐧 Red Hat/HSBC Environment Setup

### 1. System Requirements

```bash
# Check Red Hat version
cat /etc/redhat-release

# Install required packages
sudo dnf update -y
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y nodejs npm postgresql postgresql-server postgresql-contrib
```

### 2. PostgreSQL Setup on Red Hat

```bash
# Install PostgreSQL 15 (recommended)
sudo dnf install -y postgresql15-server postgresql15-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start and enable PostgreSQL
sudo systemctl enable postgresql15
sudo systemctl start postgresql15

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE playwright_crx;
CREATE USER crx_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
ALTER USER crx_user CREATEDB;
\q
EOF

# Configure PostgreSQL for remote connections (if needed)
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
sudo echo "host all all 0.0.0.0/0 md5" >> /var/lib/pgsql/data/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql15
```

### 3. Application Setup

```bash
# Create application directory
sudo mkdir -p /opt/playwright-crx
sudo chown $USER:$USER /opt/playwright-crx
cd /opt/playwright-crx

# Clone or extract application
# git clone <repository-url> .
# or
# tar -xzf playwright-crx-YYYYMMDD.tar.gz

# Setup backend
cd playwright-crx-enhanced/backend
npm install --production
cp .env.example .env

# Edit .env file with production values
nano .env

# Run database migrations
npx prisma migrate deploy

# Create systemd service
sudo tee /etc/systemd/system/playwright-crx.service > /dev/null << EOF
[Unit]
Description=Playwright CRX Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=playwright
WorkingDirectory=/opt/playwright-crx/playwright-crx-enhanced/backend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# Create service user
sudo useradd -r -s /bin/false playwright
sudo chown -R playwright:playwright /opt/playwright-crx

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable playwright-crx
sudo systemctl start playwright-crx

# Check service status
sudo systemctl status playwright-crx
```

### 4. Firewall Configuration

```bash
# Open required ports
sudo firewall-cmd --permanent --add-port=3000/tcp  # Backend API
sudo firewall-cmd --permanent --add-port=3001/tcp  # WebSocket
sudo firewall-cmd --reload

# Check open ports
sudo firewall-cmd --list-ports
```

---

## 🧪 Testing and Verification

### 1. Extension Testing

```bash
# Load extension in Chrome
# 1. Open Chrome
# 2. Go to chrome://extensions/
# 3. Enable Developer mode
# 4. Click "Load unpacked"
# 5. Select examples/recorder-crx/dist folder

# Test extension functionality
# 1. Click extension icon
# 2. Try recording a simple action
# 3. Check if backend connection works
```

### 2. Backend Testing

```bash
# Test API endpoints
curl -X GET http://localhost:3000/api/health

# Test database connection
cd playwright-crx-enhanced/backend
npx prisma db pull --print

# Check logs
sudo journalctl -u playwright-crx -f
```

### 3. Integration Testing

```bash
# Test complete workflow
# 1. Start backend
# 2. Load extension
# 3. Record a test script
# 4. Save script to database
# 5. Retrieve and execute script
```

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Extension Build Fails

```bash
# Clear node_modules and reinstall
rm -rf examples/recorder-crx/node_modules
cd examples/recorder-crx && npm install

# Check Node.js version
node --version  # Should be 16+
npm --version   # Should be 8+
```

#### 2. Backend Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql15

# Check database connection
psql -h localhost -U crx_user -d playwright_crx -c "SELECT version();"

# Check backend logs
sudo journalctl -u playwright-crx -n 50
```

#### 3. Permission Issues on Red Hat

```bash
# Fix file permissions
sudo chown -R playwright:playwright /opt/playwright-crx
sudo chmod +x /opt/playwright-crx/playwright-crx-enhanced/backend/dist/index.js

# Check SELinux status
sudo getenforce
# If enforcing, set context:
sudo semanage fcontext -a -t httpd_sys_content_t "/opt/playwright-crx(/.*)?"
sudo restorecon -R /opt/playwright-crx
```

#### 4. Database Migration Issues

```bash
# Reset database (WARNING: This deletes all data)
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS playwright_crx;
CREATE DATABASE playwright_crx;
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
\q
EOF

# Re-run migrations
cd playwright-crx-enhanced/backend
npx prisma migrate deploy
```

---

## 📝 Deployment Checklist

### Pre-Deployment

- [ ] All tests pass on development machine
- [ ] Extension builds successfully
- [ ] Backend builds successfully
- [ ] Database backup created
- [ ] Environment variables documented
- [ ] Security review completed

### Post-Deployment

- [ ] Extension loads in Chrome
- [ ] Backend API responds
- [ ] Database connection works
- [ ] All features functional
- [ ] Logs are being collected
- [ ] Monitoring is configured

### Security Checklist

- [ ] Default passwords changed
- [ ] HTTPS configured
- [ ] Firewall rules applied
- [ ] SELinux configured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Logs are monitored

---

## 📞 Support

For issues during deployment:

1. Check logs: `sudo journalctl -u playwright-crx -f`
2. Verify database: `psql -h localhost -U crx_user -d playwright_crx`
3. Test API: `curl -X GET http://localhost:3000/api/health`
4. Check extension: Chrome Developer Tools console

For additional support, refer to:
- [DATABASE_INTEGRATION_CODE.md](./DATABASE_INTEGRATION_CODE.md)
- [EXTENSION_BUILD_GUIDE.md](./EXTENSION_BUILD_GUIDE.md)
- [REDHAT_DEPLOYMENT_GUIDE.md](./REDHAT_DEPLOYMENT_GUIDE.md)