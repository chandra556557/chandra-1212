# 🗄️ Database Migration Scripts for Playwright CRX

This document contains all necessary scripts for backing up, restoring, and migrating the PostgreSQL database from your current environment to the HSBC Red Hat environment.

## 📋 Table of Contents

1. [Database Backup Script](#database-backup-script)
2. [Database Restore Script](#database-restore-script)
3. [Migration to Red Hat Script](#migration-to-red-hat-script)
4. [Cross-Platform Build Script](#cross-platform-build-script)
5. [Windows Build Script](#windows-build-script)
6. [Setup Instructions](#setup-instructions)

---

## 1. Database Backup Script

Create `scripts/backup-database.sh`:

```bash
#!/bin/bash

# Database Backup Script for Playwright CRX
# This script creates a complete backup of playwright_crx database

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

### Windows Version (backup-database.bat)

```batch
@echo off
REM Database Backup Script for Playwright CRX (Windows)

setlocal enabledelayedexpansion

REM Load environment variables
if exist "playwright-crx-enhanced\backend\.env" (
    for /f "tokens=1,2 delims==" %%a in (playwright-crx-enhanced\backend\.env) do (
        set %%a=%%b
    )
) else (
    echo Error: .env file not found
    exit /b 1
)

REM Create backup directory
set BACKUP_DIR=.\backups
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set TIMESTAMP=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIMESTAMP=!TIMESTAMP!_%%a%%b
set TIMESTAMP=!TIMESTAMP: =0!
set BACKUP_FILE=%BACKUP_DIR%\playwright_crx_backup_%TIMESTAMP%.sql

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo 🔒 Creating database backup...
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo Backup file: %BACKUP_FILE%

REM Create backup
pg_dump "%DATABASE_URL%" > "%BACKUP_FILE%"

REM Compress backup
powershell Compress-Archive -Path "%BACKUP_FILE%" -DestinationPath "%BACKUP_FILE%.gz"
del "%BACKUP_FILE%"

set BACKUP_FILE=%BACKUP_FILE%.gz

echo ✅ Backup created successfully: %BACKUP_FILE%

REM Create backup metadata
echo Backup Information: > "%BACKUP_FILE%.meta"
echo ================== >> "%BACKUP_FILE%.meta"
echo Database: %DB_NAME% >> "%BACKUP_FILE%.meta"
echo Host: %DB_HOST%:%DB_PORT% >> "%BACKUP_FILE%.meta"
echo Created: %date% %time% >> "%BACKUP_FILE%.meta"

echo 📄 Metadata file created: %BACKUP_FILE%.meta
```

---

## 2. Database Restore Script

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

### Windows Version (restore-database.bat)

```batch
@echo off
REM Database Restore Script for Playwright CRX (Windows)

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Usage: %0 ^<backup_file^>
    echo Example: %0 backups\playwright_crx_backup_20240101_120000.sql.gz
    exit /b 1
)

set BACKUP_FILE=%~1

if not exist "%BACKUP_FILE%" (
    echo Error: Backup file not found: %BACKUP_FILE%
    exit /b 1
)

REM Load environment variables
if exist "playwright-crx-enhanced\backend\.env" (
    for /f "tokens=1,2 delims==" %%a in (playwright-crx-enhanced\backend\.env) do (
        set %%a=%%b
    )
) else (
    echo Error: .env file not found
    exit /b 1
)

echo 🔄 Restoring database from backup...
echo Backup file: %BACKUP_FILE%
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%

REM Extract and restore
if "%BACKUP_FILE:~-3%"==".gz" (
    powershell "Expand-Archive -Path '%BACKUP_FILE%' -DestinationPath temp -Force"
    for %%f in (temp\*.sql) do set SQL_FILE=%%f
    psql "%DATABASE_URL%" < "!SQL_FILE!"
    rmdir /s /q temp
) else (
    psql "%DATABASE_URL%" < "%BACKUP_FILE%"
)

echo ✅ Database restored successfully

REM Run migrations to ensure schema is up to date
cd playwright-crx-enhanced\backend
npx prisma migrate deploy

echo 🔄 Database migrations applied
```

---

## 3. Migration to Red Hat Script

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

# 2. Create migration package
echo "📦 Step 2: Creating migration package..."
MIGRATION_DIR="./migration-package-$TIMESTAMP"
mkdir -p "$MIGRATION_DIR"

# Copy backup
cp "$LATEST_BACKUP" "$MIGRATION_DIR/"
cp "${LATEST_BACKUP}.meta" "$MIGRATION_DIR/"

# Copy application files
cp -r playwright-crx-enhanced "$MIGRATION_DIR/"
cp -r examples "$MIGRATION_DIR/"
cp README.md "$MIGRATION_DIR/"
cp DEPLOYMENT_GUIDE.md "$MIGRATION_DIR/"

# Create Red Hat setup script
cat > "$MIGRATION_DIR/setup-on-redhat.sh" << 'EOF'
#!/bin/bash

# Setup Script for Red Hat Environment
echo "🐧 Setting up Playwright CRX on Red Hat..."

# 1. Install dependencies
echo "📦 Installing system dependencies..."
sudo dnf update -y
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y nodejs npm postgresql15-server postgresql15-contrib

# 2. Setup PostgreSQL
echo "🗄️  Setting up PostgreSQL..."
sudo postgresql-setup --initdb
sudo systemctl enable postgresql15
sudo systemctl start postgresql15

# 3. Create database and user
echo "👤 Creating database and user..."
sudo -u postgres psql << 'SQLEOF'
CREATE DATABASE playwright_crx;
CREATE USER crx_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
ALTER USER crx_user CREATEDB;
\q
SQLEOF

# 4. Configure PostgreSQL
echo "⚙️  Configuring PostgreSQL..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /var/lib/pgsql/data/postgresql.conf
sudo echo "host all all 0.0.0.0/0 md5" >> /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql15

# 5. Setup application
echo "🚀 Setting up application..."
cd /opt/playwright-crx/playwright-crx-enhanced/backend
npm install --production
cp .env.example .env

echo "✅ Red Hat setup completed!"
echo "📝 Next steps:"
echo "1. Edit .env with your database credentials"
echo "2. Restore database from backup"
echo "3. Run migrations: npx prisma migrate deploy"
echo "4. Start service: sudo systemctl start playwright-crx"
EOF

chmod +x "$MIGRATION_DIR/setup-on-redhat.sh"

# Create Windows transfer script
cat > "$MIGRATION_DIR/transfer-to-redhat.bat" << 'EOF'
@echo off
REM Transfer Script for Windows to Red Hat
echo "📤 Preparing files for Red Hat transfer..."

REM Create archive
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%
tar -czf "migration-package-%TIMESTAMP%.tar.gz" "migration-package-%TIMESTAMP%"

echo "✅ Migration package created: migration-package-%TIMESTAMP%.tar.gz"
echo "📝 Transfer instructions:"
echo "1. Copy migration-package-%TIMESTAMP%.tar.gz to Red Hat server"
echo "2. Extract: tar -xzf migration-package-%TIMESTAMP%.tar.gz"
echo "3. Run: ./setup-on-redhat.sh"
EOF

# Create archive
cd "$MIGRATION_DIR/.."
tar -czf "migration-package-$TIMESTAMP.tar.gz" "migration-package-$TIMESTAMP"
cd ..

echo "✅ Migration package created: migration-package-$TIMESTAMP.tar.gz"
echo ""
echo "📋 Migration Steps:"
echo "1. Transfer migration-package-$TIMESTAMP.tar.gz to Red Hat server"
echo "2. Extract: tar -xzf migration-package-$TIMESTAMP.tar.gz"
echo "3. Run: ./setup-on-redhat.sh"
echo "4. Restore database: ./restore-database.sh <backup_file>"
echo "5. Configure and start application"
```

---

## 4. Cross-Platform Build Script

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
cp DATABASE_MIGRATION_SCRIPTS.md "$DIST_DIR/"

# Copy scripts
mkdir -p "$DIST_DIR/scripts"
cp scripts/*.sh "$DIST_DIR/scripts/" 2>/dev/null || true
cp scripts/*.bat "$DIST_DIR/scripts/" 2>/dev/null || true

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

---

## 5. Windows Build Script

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
copy DATABASE_MIGRATION_SCRIPTS.md "%DIST_DIR%\"

REM Copy scripts
if exist scripts (
    xcopy /Y scripts\*.sh "%DIST_DIR%\scripts\" 2>nul
    xcopy /Y scripts\*.bat "%DIST_DIR%\scripts\" 2>nul
)

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

## 6. Setup Instructions

### Step 1: Create Scripts Directory

```bash
# Create scripts directory
mkdir -p scripts

# Make scripts executable (Linux/Mac)
chmod +x scripts/*.sh
```

### Step 2: Execute Database Backup

```bash
# On Linux/Mac
./scripts/backup-database.sh

# On Windows
scripts\backup-database.bat
```

### Step 3: Build Application

```bash
# On Linux/Mac
./scripts/build-all.sh

# On Windows
scripts\build-all.bat
```

### Step 4: Create Migration Package

```bash
# On Linux/Mac
./scripts/migrate-to-redhat.sh

# On Windows
scripts\migrate-to-redhat.bat
```

### Step 5: Transfer to Red Hat

1. Copy the generated migration package to Red Hat server
2. Extract the package
3. Run the setup script
4. Restore the database
5. Configure and start the application

### Step 6: Verify Installation

```bash
# Test database connection
psql -h localhost -U crx_user -d playwright_crx -c "SELECT version();"

# Test backend
curl -X GET http://localhost:3000/api/health

# Test extension
# Load in Chrome and verify functionality
```

---

## 📝 Additional Notes

### Security Considerations

1. **Password Security**: Always use strong passwords for production
2. **File Permissions**: Ensure proper file permissions on Red Hat
3. **Network Security**: Configure firewall rules appropriately
4. **Database Access**: Restrict database access to authorized users

### Troubleshooting

1. **Backup Issues**: Check database connection and permissions
2. **Build Failures**: Verify Node.js and npm versions
3. **Migration Problems**: Check PostgreSQL logs and configuration
4. **Extension Issues**: Verify manifest.json and permissions

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes are created
2. **Connection Pooling**: Configure database connection pool
3. **Caching**: Implement appropriate caching strategies
4. **Monitoring**: Set up monitoring and alerting

---

## 🆘 Support

For issues during migration:

1. Check logs: `sudo journalctl -u playwright-crx -f`
2. Verify database: `psql -h localhost -U crx_user -d playwright_crx`
3. Test API: `curl -X GET http://localhost:3000/api/health`
4. Check extension: Chrome Developer Tools console

For additional support, refer to:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- [DATABASE_INTEGRATION_CODE.md](./DATABASE_INTEGRATION_CODE.md)
- [EXTENSION_BUILD_GUIDE.md](./EXTENSION_BUILD_GUIDE.md)