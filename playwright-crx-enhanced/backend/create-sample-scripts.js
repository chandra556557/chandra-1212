const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'playwright_crx1',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function createSampleScript() {
  try {
    console.log('Creating sample script...\n');

    // Get the first user (admin)
    const userResult = await pool.query('SELECT id FROM "User" LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    const userId = userResult.rows[0].id;

    // Get the first project
    const projectResult = await pool.query('SELECT id FROM "Project" LIMIT 1');
    const projectId = projectResult.rows.length > 0 ? projectResult.rows[0].id : null;

    // Sample Playwright script
    const sampleCode = `import { test, expect } from '@playwright/test';

test('sample login test', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://example.com/login');
  
  // Fill in credentials
  await page.fill('[data-testid="email-input"]', 'user@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  
  // Click login button
  await page.click('[data-testid="login-button"]');
  
  // Verify successful login
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome');
});`;

    // Insert sample script
    const insertQuery = `
      INSERT INTO "Script" (
        id, name, description, language, code, "projectId", "userId",
        "browserType", "testIdAttribute", "selfHealingEnabled",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      RETURNING id, name;
    `;

    const scripts = [
      {
        name: 'Sample Login Test',
        description: 'Basic login flow with credential validation',
        language: 'typescript',
        code: sampleCode
      },
      {
        name: 'E2E Checkout Flow',
        description: 'End-to-end test for product checkout process',
        language: 'typescript',
        code: sampleCode.replace('login', 'checkout')
      },
      {
        name: 'API Integration Test',
        description: 'Testing REST API endpoints and responses',
        language: 'javascript',
        code: sampleCode.replace('login', 'api')
      }
    ];

    for (const script of scripts) {
      const result = await pool.query(insertQuery, [
        script.name,
        script.description,
        script.language,
        script.code,
        projectId,
        userId,
        'chromium',
        'data-testid',
        true
      ]);
      
      console.log(`✅ Created script: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    console.log('\n✅ All sample scripts created successfully!');
    console.log('\nNow you can:');
    console.log('1. Refresh your browser at http://localhost:5174');
    console.log('2. Navigate to "Scripts" view');
    console.log('3. Click "🚀 Show Workflow" on any script');
    console.log('4. You should see the 5 cue cards!\n');

  } catch (error) {
    console.error('❌ Error creating sample scripts:', error);
  } finally {
    await pool.end();
  }
}

createSampleScript();
