@echo off
REM Database Restore Script for Playwright CRX (Windows)

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo ❌ Error: No backup file specified
    echo.
    echo Usage: %0 ^<backup_file^>
    echo.
    echo Example: %0 backups\playwright_crx_backup_20240101_120000.sql.gz
    echo.
    exit /b 1
)

set BACKUP_FILE=%~1

if not exist "%BACKUP_FILE%" (
    echo ❌ Error: Backup file not found: %BACKUP_FILE%
    exit /b 1
)

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

echo 🔄 Restoring database from backup...
echo 📁 Backup file: %BACKUP_FILE%
echo 📊 Database: %DB_NAME%
echo 🌐 Host: %DB_HOST%:%DB_PORT%

REM Check if psql is available
where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: psql command not found
    echo Please ensure PostgreSQL is installed and psql is in your PATH
    exit /b 1
)

REM Extract and restore
if "%BACKUP_FILE:~-3%"==".gz" (
    echo 🗜️  Extracting compressed backup...
    
    REM Create temp directory
    if not exist "temp" mkdir "temp"
    
    REM Extract using PowerShell
    powershell -Command "Expand-Archive -Path '%BACKUP_FILE%' -DestinationPath 'temp' -Force"
    if %errorlevel% neq 0 (
        echo ❌ Extraction failed!
        exit /b 1
    )
    
    REM Find SQL file
    set SQL_FILE=
    for %%f in (temp\*.sql) do set SQL_FILE=%%f
    
    if "!SQL_FILE!"=="" (
        echo ❌ No SQL file found in extracted archive
        rmdir /s /q temp
        exit /b 1
    )
    
    echo 📄 Restoring from: !SQL_FILE!
    
    REM Restore database
    psql "%DATABASE_URL%" < "!SQL_FILE!"
    set RESTORE_ERROR=%errorlevel%
    
    REM Cleanup
    rmdir /s /q temp
    
    if %RESTORE_ERROR% neq 0 (
        echo ❌ Database restore failed!
        exit /b 1
    )
) else (
    echo 📄 Restoring directly from SQL file...
    psql "%DATABASE_URL%" < "%BACKUP_FILE%"
    if %errorlevel% neq 0 (
        echo ❌ Database restore failed!
        exit /b 1
    )
)

echo ✅ Database restored successfully!

REM Run migrations to ensure schema is up to date
echo 🔄 Running database migrations...
cd playwright-crx-enhanced\backend

REM Check if npx is available
where npx >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Warning: npx not found, skipping migrations
    echo Please run migrations manually: npx prisma migrate deploy
) else (
    npx prisma migrate deploy
    if %errorlevel% neq 0 (
        echo ⚠️  Warning: Migration failed, but database was restored
        echo Please check migration status and run manually if needed
    ) else (
        echo ✅ Database migrations applied successfully
    )
)

cd ..\..
echo.
echo 🎉 Database restore completed successfully!
echo 📊 Database: %DB_NAME%
echo 🌐 Host: %DB_HOST%:%DB_PORT%