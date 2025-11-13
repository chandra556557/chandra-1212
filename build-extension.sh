#!/bin/bash

# Chrome Extension Build Script
# This script builds the Chrome extension and prepares it for distribution

set -e

echo "🔨 Building Chrome Extension..."

# Navigate to the extension directory
cd examples/recorder-crx

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the extension
echo "🏗️  Building extension..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Extension files are in the dist/ folder"
    echo ""
    echo "To load the extension in Chrome:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked'"
    echo "4. Select the examples/recorder-crx/dist folder"
    echo ""
    echo "To create a distributable package:"
    echo "cd examples/recorder-crx && zip -r extension.zip dist/"
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi