# Chrome Extension Build and Usage Guide

## Problem
When you clone the repository and try to use the Chrome extension directly, it doesn't work because the extension needs to be built first. The source code is in TypeScript and needs to be compiled and bundled.

## Solution

### Option 1: Manual Build Steps

1. **Navigate to the extension directory:**
   ```bash
   cd examples/recorder-crx
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the extension:**
   ```bash
   npm run build
   ```
   This will create a `dist/` folder with all the compiled files.

4. **Load the extension in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `examples/recorder-crx/dist` folder

### Option 2: Using Build Scripts

For Windows:
```bash
build-extension.bat
```

For Linux/Mac:
```bash
chmod +x build-extension.sh
./build-extension.sh
```

### Option 3: One-time Setup for Distribution

If you want to include the built extension in the repository so others can use it immediately:

1. Build the extension using Option 1 or 2
2. Commit the `dist/` folder:
   ```bash
   git add examples/recorder-crx/dist/
   git commit -m "Add built extension files"
   git push origin main
   ```

## File Structure After Build

```
examples/recorder-crx/
├── dist/                    # Built extension (load this in Chrome)
│   ├── index.html          # Main extension page
│   ├── preferences.html    # Options page
│   ├── background.js       # Service worker
│   ├── empty.html          # Side panel page
│   ├── manifest.json       # Extension manifest
│   ├── *.js                # Compiled JavaScript files
│   ├── *.css               # Stylesheets
│   └── *.png               # Icons
├── src/                    # Source TypeScript files
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## Why This Is Necessary

The Chrome extension is built with:
- **TypeScript**: Provides type safety and better development experience
- **Vite**: A modern build tool that bundles and optimizes the code
- **React**: For the user interface components

Chrome extensions can only load plain JavaScript, HTML, and CSS files, so the TypeScript and JSX must be compiled first.

## For Users Who Just Want to Use the Extension

If you've already built the extension and committed the `dist/` folder, users can:

1. Clone the repository
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `examples/recorder-crx/dist` folder

## For Developers

If you're modifying the extension:

1. Make your changes in the `src/` folder
2. Run `npm run build` to compile
3. Reload the extension in Chrome (click the reload button on the extension card)
4. For faster development, consider using `npm run dev` if available (watch mode)

## Troubleshooting

- **Extension doesn't load**: Check the Chrome extensions page for errors
- **Build fails**: Ensure all dependencies are installed with `npm install`
- **Missing files**: Verify the `dist/` folder contains all necessary files including `manifest.json`