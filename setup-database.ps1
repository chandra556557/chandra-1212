# Playwright-CRX Database Setup Script
# Run this AFTER installing PostgreSQL

Write-Host "🎭 Playwright-CRX Database Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Generate compact .env upfront
Write-Host "Step 0: Generating compact .env" -ForegroundColor Yellow
$envContent = @"
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx
DB_USER=playwright_user
DB_PASSWORD=playwright123
DB_SCHEMA=public

JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret

PORT=3000
ALLOWED_ORIGINS=http://localhost:3000
"@
Set-Content -Path ".\playwright-crx-enhanced\backend\.env" -Value $envContent -Encoding UTF8
Write-Host "✅ .env created at playwright-crx-enhanced\backend\.env" -ForegroundColor Green

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $pgVersion = & psql --version 2>&1
    Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found! Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Step 1: Creating Database" -ForegroundColor Yellow
Write-Host "You will be prompted for the PostgreSQL password..." -ForegroundColor Gray

# Create database and user
$sqlCommands = @"
CREATE DATABASE playwright_crx;
CREATE USER playwright_user WITH PASSWORD 'playwright123';
GRANT ALL PRIVILEGES ON DATABASE playwright_crx TO playwright_user;
"@

# Write SQL to temp file
$sqlCommands | Out-File -FilePath "temp_setup.sql" -Encoding UTF8

# Execute SQL
try {
    & psql -U postgres -f temp_setup.sql
    Remove-Item "temp_setup.sql"
    Write-Host "✅ Database created successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Database might already exist or permission denied" -ForegroundColor Yellow
    Remove-Item "temp_setup.sql" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Step 2: Installing Backend Dependencies" -ForegroundColor Yellow
Set-Location -Path ".\playwright-crx-enhanced\backend"

if (Test-Path "node_modules") {
    Write-Host "⏭️ Dependencies already installed" -ForegroundColor Gray
} else {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Running SQL Migrations (psql)" -ForegroundColor Yellow

# Apply SQL migrations from prisma/migrations using psql
$migrationDir = ".\prisma\migrations"
if (Test-Path $migrationDir) {
    $migrations = Get-ChildItem -Path $migrationDir -Directory | Sort-Object Name
    foreach ($m in $migrations) {
        $sqlPath = Join-Path $m.FullName "migration.sql"
        if (Test-Path $sqlPath) {
            Write-Host "Applying migration: $($m.Name)" -ForegroundColor Gray
            & psql -h localhost -p 5432 -U playwright_user -d playwright_crx -f $sqlPath
        }
    }
    Write-Host "✅ SQL migrations applied" -ForegroundColor Green
} else {
    Write-Host "⚠️ No migrations directory found at $migrationDir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Optional seed (skipped)" -ForegroundColor Yellow
Write-Host "⏭️ Skipping seed (Prisma removed)" -ForegroundColor Gray

Write-Host ""
Write-Host "🎉 Database Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start backend:  npm run dev" -ForegroundColor White
Write-Host "2. Start frontend: cd ../frontend && npm install && npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Database Info:" -ForegroundColor Cyan
Write-Host "  Host:     localhost" -ForegroundColor White
Write-Host "  Port:     5432" -ForegroundColor White
Write-Host "  Database: playwright_crx" -ForegroundColor White
Write-Host "  User:     playwright_user" -ForegroundColor White
Write-Host "  Password: playwright123" -ForegroundColor White
Write-Host ""

# Return to root
Set-Location -Path "..\.."
