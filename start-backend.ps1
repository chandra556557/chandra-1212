# Start Playwright CRX Backend Server
Write-Host "Starting Playwright CRX Backend..."

Set-Location "playwright-crx-enhanced\backend"
Write-Host "Changing to backend directory..."

# Check if node_modules exists, install if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

Write-Host "Running database migrations..."
npx prisma migrate dev

Write-Host "Starting backend server..."
npm run dev

Write-Host "Backend server started!"
Write-Host "Press Ctrl+C to stop"

# Keep window open
Read-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoExit, IncludeKeyDown")