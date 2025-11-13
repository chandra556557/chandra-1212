@echo off
REM Chrome Extension Build Script for Windows
REM This script builds the Chrome extension and prepares it for distribution

echo 🔨 Building Chrome Extension...

REM Navigate to the extension directory
cd examples\recorder-crx

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Build the extension
echo 🏗️  Building extension...
npm run build

REM Check if build was successful
if exist "dist" (
    echo ✅ Build successful! Extension files are in the dist\ folder
    echo.
    echo To load the extension in Chrome:
    echo 1. Open Chrome and go to chrome://extensions/
    echo 2. Enable 'Developer mode'
    echo 3. Click 'Load unpacked'
    echo 4. Select the examples\recorder-crx\dist folder
    echo.
    echo To create a distributable package:
    echo cd examples\recorder-crx && powershell Compress-Archive -Path dist\* -DestinationPath extension.zip
) else (
    echo ❌ Build failed! Please check the error messages above.
    exit /b 1
)

cd ..\..