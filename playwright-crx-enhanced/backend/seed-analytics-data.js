/**
 * Seed Analytics Data Script
 * Populates sample test run data for analytics visualization
 */

const { Pool } = require('pg');
const { randomUUID } = require('crypto');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/playwright_crx1'
});

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting to seed analytics data...\n');

    // Get user and project
    const userResult = await client.query('SELECT id FROM "User" LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    const userId = userResult.rows[0].id;

    const projectResult = await client.query('SELECT id FROM "Project" WHERE "userId" = $1 LIMIT 1', [userId]);
    if (projectResult.rows.length === 0) {
      console.log('❌ No projects found. Please create a project first.');
      return;
    }
    const projectId = projectResult.rows[0].id;

    // Get or create scripts
    let scriptResult = await client.query('SELECT id FROM "Script" WHERE "userId" = $1 LIMIT 5', [userId]);
    let scriptIds = scriptResult.rows.map(r => r.id);

    // Create scripts if needed
    if (scriptIds.length === 0) {
      console.log('📝 Creating sample scripts...');
      const scriptNames = [
        'Login Test',
        'Checkout Flow',
        'Search Functionality',
        'User Registration',
        'Product Details'
      ];

      for (const name of scriptNames) {
        const scriptId = randomUUID();
        await client.query(
          `INSERT INTO "Script" (id, name, description, language, code, "userId", "projectId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, 'typescript', 'test("example", async ({ page }) => {});', $4, $5, NOW(), NOW())`,
          [scriptId, name, `Sample ${name} script`, userId, projectId]
        );
        scriptIds.push(scriptId);
      }
      console.log(`✅ Created ${scriptIds.length} scripts\n`);
    }

    // Generate test runs over the last 30 days
    console.log('📊 Generating test run data...');
    
    const statuses = ['passed', 'failed', 'error'];
    const browsers = ['chromium', 'firefox', 'webkit'];
    const errorMessages = [
      'Timeout waiting for selector',
      'Element not visible',
      'Network request failed',
      'Assertion failed: expected true to be false',
      'Click intercepted by another element',
      null, null, null // More passed tests
    ];

    const now = new Date();
    let testRunCount = 0;

    // Create 100 test runs
    for (let i = 0; i < 100; i++) {
      const scriptId = scriptIds[Math.floor(Math.random() * scriptIds.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const startedAt = new Date(now);
      startedAt.setDate(startedAt.getDate() - daysAgo);
      startedAt.setHours(Math.floor(Math.random() * 24));
      startedAt.setMinutes(Math.floor(Math.random() * 60));

      // Higher chance of passed tests
      const statusWeights = [0.7, 0.2, 0.1]; // 70% passed, 20% failed, 10% error
      const rand = Math.random();
      let status;
      if (rand < statusWeights[0]) status = 'passed';
      else if (rand < statusWeights[0] + statusWeights[1]) status = 'failed';
      else status = 'error';

      const browser = browsers[Math.floor(Math.random() * browsers.length)];
      const duration = status === 'passed' 
        ? Math.floor(Math.random() * 30000) + 5000  // 5-35 seconds
        : Math.floor(Math.random() * 20000) + 2000; // 2-22 seconds

      const errorMsg = status !== 'passed' 
        ? errorMessages[Math.floor(Math.random() * 5)]
        : null;

      const completedAt = new Date(startedAt);
      completedAt.setMilliseconds(completedAt.getMilliseconds() + duration);

      await client.query(
        `INSERT INTO "TestRun" (
          id, "scriptId", "userId", status, duration, "errorMsg", 
          browser, "startedAt", "completedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          randomUUID(),
          scriptId,
          userId,
          status,
          duration,
          errorMsg,
          browser,
          startedAt,
          completedAt
        ]
      );
      testRunCount++;
    }

    console.log(`✅ Created ${testRunCount} test runs`);

    // Summary
    const summary = await client.query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(duration) as avg_duration
      FROM "TestRun"
      GROUP BY status
      ORDER BY status
    `);

    console.log('\n📈 Analytics Summary:');
    console.log('═══════════════════════════════════════');
    summary.rows.forEach(row => {
      console.log(`  ${row.status.toUpperCase().padEnd(10)} : ${row.count} runs (avg: ${Math.round(row.avg_duration/1000)}s)`);
    });

    const browserStats = await client.query(`
      SELECT 
        browser,
        COUNT(*) as count
      FROM "TestRun"
      GROUP BY browser
      ORDER BY count DESC
    `);

    console.log('\n🌐 Browser Distribution:');
    browserStats.rows.forEach(row => {
      console.log(`  ${row.browser.padEnd(10)} : ${row.count} runs`);
    });

    console.log('\n✨ Analytics data seeded successfully!');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();
