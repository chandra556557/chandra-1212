# Self-Healing Database Migration Script
# Adds 'reason' column to SelfHealingLocator table

Write-Host "=== Self-Healing Database Migration ===" -ForegroundColor Cyan
Write-Host ""

# Load environment variables
$envFile = ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
}

$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "playwright_crx" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "playwright_user" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST"
Write-Host "  Port: $DB_PORT"
Write-Host "  Database: $DB_NAME"
Write-Host "  User: $DB_USER"
Write-Host ""

# Read migration SQL
$migrationFile = "migrations\create_self_healing_tables.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found: $migrationFile" -ForegroundColor Red
    exit 1
}

$sqlContent = Get-Content $migrationFile -Raw

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlPath) {
    Write-Host "psql not found. Using node-postgres instead..." -ForegroundColor Yellow
    
    # Create a Node.js script to run the migration
    $nodeScript = @"
const { Pool } = require('pg');

const pool = new Pool({
    host: '$DB_HOST',
    port: $DB_PORT,
    database: '$DB_NAME',
    user: '$DB_USER',
    password: '$DB_PASSWORD'
});

const sql = ``$sqlContent``;

async function runMigration() {
    try {
        console.log('Running migration...');
        const result = await pool.query(sql);
        console.log('✅ Migration completed successfully!');
        console.log('Messages:', result);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
"@

    $nodeScript | Out-File -FilePath "temp_migration.js" -Encoding utf8
    
    Write-Host "Executing migration..." -ForegroundColor Cyan
    node temp_migration.js
    
    Remove-Item "temp_migration.js" -ErrorAction SilentlyContinue
    
} else {
    # Use psql if available
    Write-Host "Executing migration with psql..." -ForegroundColor Cyan
    $env:PGPASSWORD = $DB_PASSWORD
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migrationFile
}

Write-Host ""
Write-Host "=== Migration Complete ===" -ForegroundColor Green
