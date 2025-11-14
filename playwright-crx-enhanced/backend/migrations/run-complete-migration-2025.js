#!/usr/bin/env node

/**
 * Complete Database Migration Runner
 * 
 * This script runs the comprehensive migration script that creates all tables
 * for the playwright-crx-enhanced application including:
 * - Core tables (User, Project, Script, TestRun, etc.)
 * - API Testing tables (api_test_suites, api_test_cases, etc.)
 * - Test Data Repository tables (test_data_repositories, etc.)
 * - External API Integration tables (ExternalAPIConfig, APICallLog)
 * - Row Level Security (RLS) policies for multi-tenancy
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration
const DB_USER = process.env.DB_USER || process.env.PGUSER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.PGPASSWORD || 'postgres124112';
const DB_HOST = process.env.DB_HOST || process.env.PGHOST || 'localhost';
const DB_PORT = process.env.DB_PORT || process.env.PGPORT || '5433';
const DB_NAME = process.env.DB_NAME || process.env.PGDATABASE || 'playwright_crx1';

const DATABASE_URL = process.env.DATABASE_URL || 
  `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

// Migration file path
const MIGRATION_FILE = path.join(__dirname, 'complete_migration_2025.sql');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
  let pool;
  
  try {
    log('\n🚀 Starting Complete Database Migration...', 'cyan');
    log(`📡 Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}`, 'blue');
    
    // Create connection pool
    pool = new Pool({ 
      connectionString: DATABASE_URL,
      ssl: false // Set to true for production with SSL
    });
    
    // Test connection
    const client = await pool.connect();
    log('✅ Database connection established', 'green');
    
    // Read migration file
    log(`📖 Reading migration file: ${MIGRATION_FILE}`, 'yellow');
    const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
    
    if (!migrationSQL || migrationSQL.trim().length === 0) {
      throw new Error('Migration file is empty or could not be read');
    }
    
    log(`📊 Migration file size: ${migrationSQL.length} characters`, 'blue');
    
    // Split migration into individual statements for better error handling
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt.endsWith(';') ? stmt : stmt + ';');
    
    log(`🔧 Found ${statements.length} SQL statements to execute`, 'blue');
    
    // Execute migration in a transaction
    await client.query('BEGIN');
    log('🔄 Starting transaction...', 'yellow');
    
    let executedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementNumber = i + 1;
      
      try {
        // Skip empty statements or comments
        if (!statement || statement.trim().length === 0 || statement.trim().startsWith('--')) {
          skippedCount++;
          continue;
        }
        
        // Log progress for major operations
        if (statement.toUpperCase().includes('CREATE TABLE') || 
            statement.toUpperCase().includes('DROP TABLE') ||
            statement.toUpperCase().includes('CREATE INDEX') ||
            statement.toUpperCase().includes('CREATE TRIGGER') ||
            statement.toUpperCase().includes('CREATE POLICY')) {
          log(`  Executing statement ${statementNumber}/${statements.length}: ${statement.substring(0, 50)}...`, 'cyan');
        }
        
        await client.query(statement);
        executedCount++;
        
      } catch (error) {
        // Handle specific PostgreSQL error codes
        if (error.code === '42P07') { // Table already exists
          log(`  ⚠️  Table already exists (skipping): ${error.message}`, 'yellow');
          skippedCount++;
        } else if (error.code === '42710') { // Object already exists
          log(`  ⚠️  Object already exists (skipping): ${error.message}`, 'yellow');
          skippedCount++;
        } else if (error.code === '42P01') { // Table doesn't exist (for DROP)
          log(`  ⚠️  Table doesn't exist (skipping): ${error.message}`, 'yellow');
          skippedCount++;
        } else {
          log(`  ❌ Error in statement ${statementNumber}: ${error.message}`, 'red');
          log(`  Statement: ${statement.substring(0, 100)}...`, 'red');
          throw error;
        }
      }
    }
    
    await client.query('COMMIT');
    log('✅ Transaction committed successfully', 'green');
    log(`📊 Executed: ${executedCount}, Skipped: ${skippedCount} statements`, 'blue');
    
    // Verify migration by checking table counts
    log('\n🔍 Verifying migration...', 'cyan');
    
    const verificationQueries = [
      { name: 'Core Tables', query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('User', 'Project', 'Script', 'TestRun', 'TestStep')" },
      { name: 'API Testing Tables', query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'api_%'" },
      { name: 'Test Data Repository Tables', query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE 'test_data_%' OR table_name LIKE 'data_cleanup_%' OR table_name LIKE 'synthetic_%')" },
      { name: 'External API Tables', query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('ExternalAPIConfig', 'APICallLog')" },
      { name: 'Total Tables', query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'" }
    ];
    
    for (const { name, query } of verificationQueries) {
      const result = await client.query(query);
      log(`  ${name}: ${result.rows[0].count} tables`, 'green');
    }
    
    // List all created tables
    const tablesResult = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    log('\n📋 All created tables:', 'cyan');
    tablesResult.rows.forEach(row => {
      log(`  - ${row.table_name}`, 'white');
    });
    
    client.release();
    
    log('\n🎉 Migration completed successfully!', 'green');
    log('✨ All database tables have been created with proper relationships, indexes, and security policies.', 'green');
    
  } catch (error) {
    log('\n❌ Migration failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (pool) {
      try {
        await pool.query('ROLLBACK');
        log('🔄 Transaction rolled back', 'yellow');
      } catch (rollbackError) {
        log('❌ Failed to rollback transaction', 'red');
      }
    }
    
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      log('🔌 Database connection closed', 'blue');
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration().catch(error => {
    log(`\n💥 Unhandled error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runMigration };