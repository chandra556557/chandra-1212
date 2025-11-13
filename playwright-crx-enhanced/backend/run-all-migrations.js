// Run all remaining migrations
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'playwright_crx1';

const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

console.log('========================================');
console.log('Running Additional Migrations');
console.log('========================================\n');

console.log('Database Configuration:');
console.log(`  Host: ${DB_HOST}`);
console.log(`  Port: ${DB_PORT}`);
console.log(`  Database: ${DB_NAME}`);
console.log(`  User: ${DB_USER}\n`);

const pool = new Pool({ connectionString });

const migrationFiles = [
  'create_self_healing_tables.sql',
  'add_reason_to_self_healing.sql'
];

async function runMigrations() {
  for (const file of migrationFiles) {
    try {
      const migrationPath = path.join(__dirname, 'migrations', file);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️  Skipping ${file} - file not found`);
        continue;
      }
      
      console.log(`\n📄 Running migration: ${file}`);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      await pool.query(sql);
      console.log(`✅ ${file} completed successfully`);
      
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`⚠️  ${file} - Tables already exist, skipping`);
      } else {
        console.error(`\n❌ Migration ${file} failed:`);
        console.error('Error:', error.message);
      }
    }
  }
  
  console.log('\n========================================');
  console.log('All Migrations Complete!');
  console.log('========================================\n');
  
  // Verify tables
  console.log('Verifying database tables...\n');
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`✅ Total tables created: ${result.rows.length}\n`);
    result.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('Error verifying tables:', error.message);
  }
  
  await pool.end();
}

runMigrations();
