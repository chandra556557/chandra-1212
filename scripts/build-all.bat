@echo off
REM Universal Build Script for Playwright CRX (Windows)
REM This script builds both extension and backend for distribution

setlocal enabledelayedexpansion

echo 🏗️  Starting complete build process...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js not found
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: npm not found
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Get Node.js and npm versions
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ Node.js version: %NODE_VERSION%
echo ✅ npm version: %NPM_VERSION%
echo.

REM 1. Build Extension
echo 📦 Building Chrome Extension...
echo.

if not exist "examples\recorder-crx" (
    echo ❌ Error: Extension directory not found: examples\recorder-crx
    exit /b 1
)

cd examples\recorder-crx

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found in extension directory
    cd ..\..
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📥 Installing extension dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Extension dependency installation failed
        cd ..\..
        exit /b 1
    )
    echo ✅ Extension dependencies installed
) else (
    echo ✅ Extension dependencies already installed
)

REM Build extension
echo 🔨 Building extension...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Extension build failed
    cd ..\..
    exit /b 1
)

REM Check if build was successful
if exist "dist" (
    echo ✅ Extension build completed successfully
    for /f %%i in ('dir dist /b /s ^| find /c /v ""') do set FILE_COUNT=%%i
    echo 📁 Created %FILE_COUNT% files in dist directory
) else (
    echo ❌ Extension build failed - no dist directory created
    cd ..\..
    exit /b 1
)

cd ..\..
echo.

REM 2. Build Backend
echo 🔧 Building Backend...
echo.

if not exist "playwright-crx-enhanced\backend" (
    echo ❌ Error: Backend directory not found: playwright-crx-enhanced\backend
    exit /b 1
)

cd playwright-crx-enhanced\backend

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ Error: package.json not found in backend directory
    cd ..\..
    exit /b 1
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📥 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Backend dependency installation failed
        cd ..\..
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Build backend
echo 🔨 Building backend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Backend build failed
    cd ..\..
    exit /b 1
)

REM Check if build was successful
if exist "dist" (
    echo ✅ Backend build completed successfully
    for /f %%i in ('dir dist /b /s ^| find /c /v ""') do set FILE_COUNT=%%i
    echo 📁 Created %FILE_COUNT% files in dist directory
) else (
    echo ❌ Backend build failed - no dist directory created
    cd ..\..
    exit /b 1
)

cd ..\..
echo.

REM 3. Create Distribution Package
echo 📦 Creating distribution package...
echo.

REM Generate timestamp
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set TIMESTAMP=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIMESTAMP=!TIMESTAMP!_%%a%%b
set TIMESTAMP=!TIMESTAMP: =0!

set DIST_DIR=.\dist\playwright-crx-%TIMESTAMP%
if exist "%DIST_DIR%" rmdir /s /q "%DIST_DIR%"
mkdir "%DIST_DIR%"

echo 📁 Distribution directory: %DIST_DIR%

REM Copy extension
echo 📋 Copying extension files...
xcopy /E /I /Q examples\recorder-crx\dist "%DIST_DIR%\extension"
if %errorlevel% neq 0 (
    echo ❌ Failed to copy extension files
    exit /b 1
)

REM Copy backend
echo 📋 Copying backend files...
xcopy /E /I /Q playwright-crx-enhanced\backend\dist "%DIST_DIR%\backend"
if %errorlevel% neq 0 (
    echo ❌ Failed to copy backend files
    exit /b 1
)

REM Copy package.json and .env.example
copy playwright-crx-enhanced\backend\package.json "%DIST_DIR%\backend\" >nul
copy playwright-crx-enhanced\backend\.env.example "%DIST_DIR%\backend\.env.example" >nul

REM Copy documentation
echo 📋 Copying documentation...
copy README.md "%DIST_DIR%\" >nul
copy DEPLOYMENT_GUIDE.md "%DIST_DIR%\" >nul
copy DATABASE_MIGRATION_SCRIPTS.md "%DIST_DIR%\" >nul

REM Copy scripts
if exist "scripts" (
    echo 📋 Copying scripts...
    xcopy /Y /Q scripts\*.bat "%DIST_DIR%\scripts\" >nul 2>&1
    xcopy /Y /Q scripts\*.sh "%DIST_DIR%\scripts\" >nul 2>&1
)

REM Create setup script for Linux/Mac
echo 📝 Creating Linux/Mac setup script...
(
echo #!/bin/bash
echo echo "🚀 Setting up Playwright CRX..."
echo echo "1. Install backend dependencies"
echo cd backend
echo npm install --production
echo echo "2. Configure environment"
echo cp .env.example .env
echo echo "3. Update .env with your database credentials"
echo echo "4. Run database migrations"
echo npx prisma migrate deploy
echo echo "5. Start backend"
echo npm start
) > "%DIST_DIR%\setup.sh"

REM Create setup script for Windows
echo 📝 Creating Windows setup script...
(
echo @echo off
echo echo 🚀 Setting up Playwright CRX...
echo echo 1. Install backend dependencies
echo cd backend
echo npm install --production
echo echo 2. Configure environment
echo copy .env.example .env
echo echo 3. Update .env with your database credentials
echo echo 4. Run database migrations
echo npx prisma migrate deploy
echo echo 5. Start backend
echo npm start
) > "%DIST_DIR%\setup.bat"

REM Create installation guide
echo 📝 Creating installation guide...
(
echo # Playwright CRX Installation Guide
echo.
echo ## Quick Setup
echo.
echo ### Windows:
echo 1. Run setup.bat
echo 2. Configure .env file with your database credentials
echo 3. Run: npm start
echo.
echo ### Linux/Mac:
echo 1. Run: chmod +x setup.sh ^&^& ./setup.sh
echo 2. Configure .env file with your database credentials
echo 3. Run: npm start
echo.
echo ## Extension Installation
echo 1. Open Chrome
echo 2. Go to chrome://extensions/
echo 3. Enable Developer mode
echo 4. Click "Load unpacked"
echo 5. Select the extension folder
echo.
echo ## Database Setup
echo 1. Install PostgreSQL
echo 2. Create database: CREATE DATABASE playwright_crx;
echo 3. Create user: CREATE USER crx_user WITH PASSWORD 'your_password';
echo 4. Grant privileges: GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO crx_user;
echo 5. Update .env with database credentials
echo 6. Run migrations: npx prisma migrate deploy
) > "%DIST_DIR%\INSTALLATION.txt"

REM Calculate total size
set /a TOTAL_SIZE=0
for /r "%DIST_DIR%" %%F in (*) do set /a TOTAL_SIZE+=%%~zF
set /a TOTAL_SIZE_MB=%TOTAL_SIZE%/1048576

echo ✅ Distribution package created successfully!
echo 📁 Directory: %DIST_DIR%
echo 📏 Size: %TOTAL_SIZE_MB% MB
echo 📄 Files included:
echo    - Extension files
echo    - Backend files
echo    - Documentation
echo    - Setup scripts
echo    - Installation guide

REM Create archive
echo.
echo 🗜️  Creating distribution archive...
cd dist
powershell -Command "Compress-Archive -Path 'playwright-crx-%TIMESTAMP%' -DestinationPath 'playwright-crx-%TIMESTAMP%.zip' -Force"
if %errorlevel% neq 0 (
    echo ❌ Failed to create archive
    cd ..
    exit /b 1
)

cd ..

echo ✅ Archive created: dist\playwright-crx-%TIMESTAMP%.zip
echo.
echo 🎉 Build process completed successfully!
echo.
echo 📋 Next steps:
echo 1. Test the build locally
echo 2. Push code to GitHub
echo 3. Transfer distribution package to target environment
echo 4. Follow installation guide in the package
echo.