const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createDemoUser() {
  try {
    const pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'playwright_crx1',
      password: process.env.DB_PASSWORD || 'postgres124112',
      port: process.env.PGPORT || 5433,
    });

    console.log('Creating demo user...');
    
    const email = 'demo@example.com';
    const password = 'demo123';
    const name = 'Demo User';
    
    // Check if user already exists
    const existing = await pool.query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Demo user already exists');
      await pool.end();
      return;
    }
    
    // Create demo user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = require('crypto').randomUUID();
    
    const result = await pool.query(
      'INSERT INTO "User"(id, email, password, name, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now()) RETURNING id, email, name',
      [userId, email, hashedPassword, name]
    );
    
    console.log('Demo user created:', result.rows[0]);
    
    await pool.end();
  } catch (error) {
    console.error('Error creating demo user:', error.message);
  }
}

createDemoUser();