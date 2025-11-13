const { Pool } = require('pg');
require('dotenv').config();

async function checkUsers() {
  try {
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'playwright_crx1',
      password: process.env.DB_PASSWORD || 'postgres124112',
      port: process.env.PGPORT || 5433,
    });

    console.log('Checking users table...');
    
    // Try both users and User tables
    try {
      const result = await pool.query('SELECT id, email, name FROM users');
      console.log('Users table found:', result.rows);
    } catch (err) {
      console.log('Users table not found, trying User table...');
      try {
        const result = await pool.query('SELECT id, email, name FROM "User"');
        console.log('User table found:', result.rows);
      } catch (err2) {
        console.log('User table also not found:', err2.message);
      }
    }

    await pool.end();
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
}

checkUsers();