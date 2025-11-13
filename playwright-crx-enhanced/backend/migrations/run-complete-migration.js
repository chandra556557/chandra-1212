/**
 * Database Migration Script
 * Executes the complete schema migration
 * 
 * Usage: node run-complete-migration.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'playwright_crx1'}`,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration...\n');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'complete_schema_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration file loaded successfully');
    console.log(`📁 File: ${migrationPath}\n`);
    
    // Begin transaction
    await client.query('BEGIN');
    console.log('🔄 Transaction started\n');
    
    // Execute migration
    console.log('⚙️  Executing migration SQL...');
    await client.query(migrationSQL);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Migration SQL executed successfully\n');
    
    // Verify tables
    console.log('🔍 Verifying database tables...\n');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Tables created:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    console.log(`\n✅ Total tables: ${tablesResult.rows.length}\n`);
    
    // Verify indexes
    const indexesResult = await client.query(`
      SELECT 
        tablename,
        indexname
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `);
    
    console.log('📌 Indexes created:');
    let currentTable = '';
    indexesResult.rows.forEach((row) => {
      if (row.tablename !== currentTable) {
        currentTable = row.tablename;
        console.log(`\n   📋 ${row.tablename}:`);
      }
      console.log(`      - ${row.indexname}`);
    });
    console.log(`\n✅ Total indexes: ${indexesResult.rows.length}\n`);
    
    // Verify foreign keys
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `);
    
    console.log('🔗 Foreign key constraints:');
    fkResult.rows.forEach((row) => {
      console.log(`   ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
    });
    console.log(`\n✅ Total foreign keys: ${fkResult.rows.length}\n`);
    
    // Verify triggers
    const triggersResult = await client.query(`
      SELECT 
        trigger_name,
        event_object_table
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);
    
    console.log('⚡ Triggers created:');
    triggersResult.rows.forEach((row) => {
      console.log(`   ${row.event_object_table}: ${row.trigger_name}`);
    });
    console.log(`\n✅ Total triggers: ${triggersResult.rows.length}\n`);
    
    console.log('═══════════════════════════════════════════════════');
    console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════\n');
    
    console.log('📝 Summary:');
    console.log(`   - Tables: ${tablesResult.rows.length}`);
    console.log(`   - Indexes: ${indexesResult.rows.length}`);
    console.log(`   - Foreign Keys: ${fkResult.rows.length}`);
    console.log(`   - Triggers: ${triggersResult.rows.length}`);
    console.log('\n✨ Database is ready to use!\n');
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed!');
    console.error('Error details:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
console.log('\n═══════════════════════════════════════════════════');
console.log('  DATABASE MIGRATION SCRIPT');
console.log('  Playwright CRX Enhanced - Complete Schema');
console.log('═══════════════════════════════════════════════════\n');

runMigration().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
