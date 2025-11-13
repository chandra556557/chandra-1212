const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database configuration from environment variables
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_NAME = process.env.DB_NAME || 'playwright_crx';

const rawEnvUrl = process.env.DATABASE_URL;
const envUrl = typeof rawEnvUrl === 'string' ? rawEnvUrl.trim() : '';

// Helper function to redact password from database URL for logging
function redactDbUrl(url) {
  try {
    const u = new URL(url);
    const protocol = u.protocol;
    const user = u.username ? `${u.username}:***@` : '';
    const host = u.hostname;
    const port = u.port ? `:${u.port}` : '';
    const db = u.pathname;
    return `${protocol}//${user}${host}${port}${db}`;
  } catch {
    return 'INVALID_URL';
  }
}

// Determine connection string
let connectionString;
if (envUrl) {
  try {
    const parsed = new URL(envUrl);
    const protocolOk = parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
    const hasDbName = parsed.pathname && parsed.pathname !== '/' && parsed.pathname.length > 1;
    if (protocolOk && hasDbName) {
      connectionString = envUrl;
      console.log('✓ Using DATABASE_URL for connection:', redactDbUrl(envUrl));
    } else {
      console.log('⚠ Invalid DATABASE_URL format; falling back to discrete DB_* settings');
      console.log('  URL:', redactDbUrl(envUrl));
    }
  } catch (error) {
    console.log('⚠ Failed to parse DATABASE_URL; falling back to discrete DB_* settings');
    console.log('  Error:', error.message);
  }
}

if (!connectionString) {
  connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  console.log('✓ Using discrete DB_* environment variables:');
  console.log('  Host:', DB_HOST);
  console.log('  Port:', DB_PORT);
  console.log('  Database:', DB_NAME);
  console.log('  User:', DB_USER);
}

// SSL configuration
const ssl =
  process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : undefined;

console.log('  SSL:', ssl ? 'Enabled' : 'Disabled');
console.log('\n' + '='.repeat(60));

// Create connection pool
const pool = new Pool({
  connectionString,
  ssl,
  query_timeout: 30000,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 30000,
});

// Test database connection
async function testDatabaseConnection() {
  console.log('\n🔍 Testing PostgreSQL Database Connection...\n');
  
  let client;
  try {
    // Test 1: Connection
    console.log('Test 1: Establishing connection...');
    client = await pool.connect();
    console.log('✓ Successfully connected to database\n');

    // Test 2: Database version
    console.log('Test 2: Querying PostgreSQL version...');
    const versionResult = await client.query('SELECT version()');
    console.log('✓ PostgreSQL Version:', versionResult.rows[0].version.split(',')[0]);
    console.log();

    // Test 3: Current database
    console.log('Test 3: Checking current database...');
    const dbResult = await client.query('SELECT current_database()');
    console.log('✓ Current Database:', dbResult.rows[0].current_database);
    console.log();

    // Test 4: List tables
    console.log('Test 4: Listing tables in database...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`✓ Found ${tablesResult.rows.length} table(s):`);
      tablesResult.rows.forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.table_name}`);
      });
    } else {
      console.log('⚠ No tables found in database');
    }
    console.log();

    // Test 5: Check connection pool stats
    console.log('Test 5: Connection pool statistics...');
    console.log('✓ Total clients:', pool.totalCount);
    console.log('  Idle clients:', pool.idleCount);
    console.log('  Waiting requests:', pool.waitingCount);
    console.log();

    // Test 6: Simple query performance
    console.log('Test 6: Testing query performance...');
    const startTime = Date.now();
    await client.query('SELECT 1 as test');
    const endTime = Date.now();
    console.log(`✓ Query execution time: ${endTime - startTime}ms`);
    console.log();

    console.log('='.repeat(60));
    console.log('✅ All database connection tests passed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Database connection test failed!');
    console.error('='.repeat(60));
    console.error('Error details:');
    console.error('  Name:', error.name);
    console.error('  Message:', error.message);
    
    if (error.code) {
      console.error('  Code:', error.code);
    }
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('  1. Ensure PostgreSQL is running');
    console.error('  2. Check database credentials in .env file');
    console.error('  3. Verify database exists and user has permissions');
    console.error('  4. Check firewall settings and port accessibility');
    console.error('  5. Ensure pg package is installed: npm install pg');
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
      console.log('\n🔌 Database connection released');
    }
    await pool.end();
    console.log('🔌 Connection pool closed\n');
  }
}

// Run the test
testDatabaseConnection();
