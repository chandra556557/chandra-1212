@echo off
REM Database Backup Script for Playwright CRX (Windows)

setlocal enabledelayedexpansion

echo 🔒 Creating database backup...

REM Load environment variables
if exist "playwright-crx-enhanced\backend\.env" (
    echo 📄 Loading environment variables...
    for /f "tokens=1,2 delims==" %%a in (playwright-crx-enhanced\backend\.env) do (
        set %%a=%%b
    )
    echo ✅ Environment variables loaded
) else (
    echo ❌ Error: .env file not found in playwright-crx-enhanced\backend\
    echo Please ensure .env file exists with database configuration
    exit /b 1
)

REM Create backup directory
set BACKUP_DIR=.\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Generate timestamp
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set TIMESTAMP=%%c%%a%%b
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIMESTAMP=!TIMESTAMP!_%%a%%b
set TIMESTAMP=!TIMESTAMP: =0!
set BACKUP_FILE=%BACKUP_DIR%\playwright_crx_backup_%TIMESTAMP%.sql

echo 📊 Database: %DB_NAME%
echo 🌐 Host: %DB_HOST%:%DB_PORT%
echo 💾 Backup file: %BACKUP_FILE%

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: psql command not found
    echo Please ensure PostgreSQL is installed and psql is in your PATH
    exit /b 1
)

REM Create backup
echo 🔄 Creating backup...
pg_dump "%DATABASE_URL%" > "%BACKUP_FILE%"

if %errorlevel% neq 0 (
    echo ❌ Backup failed!
    exit /b 1
)

REM Compress backup
echo 🗜️  Compressing backup...
powershell -Command "Compress-Archive -Path '%BACKUP_FILE%' -DestinationPath '%BACKUP_FILE%.gz' -Force"
if %errorlevel% neq 0 (
    echo ❌ Compression failed!
    exit /b 1
)

REM Remove uncompressed file
del "%BACKUP_FILE%"

set BACKUP_FILE=%BACKUP_FILE%.gz

REM Get file size
for %%F in ("%BACKUP_FILE%") do set FILE_SIZE=%%~zF
set /a FILE_SIZE_MB=%FILE_SIZE%/1048576

echo ✅ Backup created successfully!
echo 📁 File: %BACKUP_FILE%
echo 📏 Size: %FILE_SIZE_MB% MB

REM Create backup metadata
echo Backup Information: > "%BACKUP_FILE%.meta"
echo ================== >> "%BACKUP_FILE%.meta"
echo Database: %DB_NAME% >> "%BACKUP_FILE%.meta"
echo Host: %DB_HOST%:%DB_PORT% >> "%BACKUP_FILE%.meta"
echo Created: %date% %time% >> "%BACKUP_FILE%.meta"
echo Size: %FILE_SIZE_MB% MB >> "%BACKUP_FILE%.meta"

echo 📄 Metadata file created: %BACKUP_FILE%.meta
echo.
echo 🎉 Database backup completed successfully!