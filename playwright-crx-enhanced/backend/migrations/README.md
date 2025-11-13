# Database Migration Guide

## Overview
This directory contains the complete database schema migration for the Playwright CRX Enhanced application.

## Files

### 1. `complete_schema_migration.sql`
Complete SQL migration script that:
- Drops all existing tables (if any)
- Creates all 12 core tables
- Sets up indexes for performance
- Creates foreign key constraints
- Adds triggers for automatic timestamp updates
- Includes verification queries

### 2. `run-complete-migration.js`
Node.js script to execute the migration with:
- Transaction support (rollback on error)
- Detailed progress logging
- Automatic verification
- Summary of created objects

## Database Schema

### Core Tables (12)
1. **User** - User accounts and authentication
2. **RefreshToken** - JWT refresh token management
3. **Project** - Project organization
4. **Script** - Playwright test scripts
5. **TestRun** - Test execution records
6. **TestStep** - Individual test step details
7. **ExtensionScript** - Browser extension scripts
8. **Variable** - Script variables
9. **Breakpoint** - Script debugging breakpoints
10. **TestSuite** - Test data suites
11. **TestData** - Test data management
12. **ApiRequest** - API testing requests

### Features
- ✅ Foreign key constraints with CASCADE deletes
- ✅ Automatic `updatedAt` timestamp triggers
- ✅ Comprehensive indexes for performance
- ✅ JSONB columns for flexible data storage
- ✅ Unique constraints where needed

## How to Run

### Method 1: Using Node.js Script (Recommended)

```bash
cd playwright-crx-enhanced/backend/migrations
node run-complete-migration.js
```

**Prerequisites:**
- Node.js installed
- `pg` package installed (`npm install pg`)
- `dotenv` package installed (`npm install dotenv`)
- `.env` file configured with database credentials

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/playwright_crx1
# OR use individual variables:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playwright_crx1
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false
```

### Method 2: Using psql (PostgreSQL CLI)

```bash
psql -U postgres -d playwright_crx1 -f complete_schema_migration.sql
```

### Method 3: Using Prisma Migrate

```bash
cd playwright-crx-enhanced/backend
npx prisma migrate reset  # WARNING: Drops all data!
npx prisma migrate deploy
npx prisma generate
```

## Post-Migration Steps

### 1. Generate Prisma Client
```bash
cd playwright-crx-enhanced/backend
npx prisma generate
```

### 2. Verify Database
```bash
node run-complete-migration.js
```

### 3. Start Application
```bash
# Backend
cd playwright-crx-enhanced/backend
npm run dev

# Frontend
cd playwright-crx-enhanced/frontend
npm run dev
```

## Verification Queries

### Check All Tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Check Indexes
```sql
SELECT tablename, indexname
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check Foreign Keys
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';
```

## Rollback

If migration fails, the script automatically rolls back. To manually reset:

```bash
# Drop all tables
psql -U postgres -d playwright_crx1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migration
node run-complete-migration.js
```

## Troubleshooting

### Error: Connection refused
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check firewall settings

### Error: Database does not exist
```sql
CREATE DATABASE playwright_crx1;
```

### Error: Permission denied
Grant permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE playwright_crx1 TO postgres;
```

### Error: Table already exists
Run cleanup first:
```bash
psql -U postgres -d playwright_crx1 -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

## Migration History

- **2025-11-10**: Complete schema with 12 tables, indexes, and triggers
- All tables include proper foreign keys and cascade deletes
- Added `executionReportUrl` to TestRun for Allure integration
- Automatic timestamp management with triggers

## Notes

- The migration script is **idempotent** - safe to run multiple times
- Uses transactions for atomic execution
- All data will be lost if tables are dropped
- Foreign key constraints ensure data integrity
- Triggers automatically update `updatedAt` timestamps
