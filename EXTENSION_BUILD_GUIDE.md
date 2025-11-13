# Chrome Extension Build Guide

This guide explains how to build the Chrome extension from source code.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Build Steps

1. Navigate to the extension directory:
   ```bash
   cd examples/recorder-crx
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

   This command will:
   - Compile TypeScript files using `tsc`
   - Build the extension using Vite
   - Create a `dist/` folder with all necessary files

## Output Structure

After building, the `dist/` folder will contain:
- `index.html` - Main extension page
- `preferences.html` - Options page
- `background.js` - Service worker
- `empty.html` - Side panel page
- `manifest.json` - Extension manifest
- Various JavaScript and CSS files
- Icon files

## Loading the Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from the extension directory

## For Distribution

If you want to distribute the extension:
1. Build the extension using the steps above
2. Zip the contents of the `dist/` folder
3. Upload the zip file to the Chrome Web Store

## Troubleshooting

- If build fails, ensure all dependencies are installed
- Make sure you have the correct Node.js version
- Check for any TypeScript errors in the source files
- Verify that the `public/manifest.json` file exists and is valid

## Automation

To automate the build process, you can:
1. Remove `dist/` from `.gitignore` if you want to include build artifacts
2. Create a pre-commit hook to build before each commit
3. Set up CI/CD to build and test automatically