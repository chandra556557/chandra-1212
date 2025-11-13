const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'playwright_crx1',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres'
});

async function viewScriptFormat() {
  try {
    const result = await pool.query(`
      SELECT 
        name,
        language,
        "browserType",
        viewport,
        "testIdAttribute",
        "selfHealingEnabled",
        LEFT(code, 200) as code_preview
      FROM "Script" 
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      console.log('No scripts found in database');
      return;
    }

    console.log('\n📝 Playwright Script Storage Format:\n');
    console.log('Field Details:');
    console.log('═'.repeat(60));
    
    const script = result.rows[0];
    
    console.log('\n1. NAME:');
    console.log('   Type: String');
    console.log('   Value:', script.name);
    
    console.log('\n2. LANGUAGE:');
    console.log('   Type: String');
    console.log('   Value:', script.language);
    console.log('   Supported: typescript, javascript, python, java, csharp');
    
    console.log('\n3. CODE:');
    console.log('   Type: TEXT (full Playwright script)');
    console.log('   Format: Plain text string');
    console.log('   Preview (first 200 chars):');
    console.log('   ', script.code_preview.replace(/\n/g, '\n    '));
    
    console.log('\n4. BROWSER TYPE:');
    console.log('   Type: String');
    console.log('   Value:', script.browserType);
    console.log('   Options: chromium, firefox, webkit');
    
    console.log('\n5. VIEWPORT:');
    console.log('   Type: JSON (nullable)');
    console.log('   Value:', script.viewport || 'null');
    console.log('   Example: {"width": 1280, "height": 720}');
    
    console.log('\n6. TEST ID ATTRIBUTE:');
    console.log('   Type: String');
    console.log('   Value:', script.testIdAttribute);
    console.log('   Purpose: Default attribute for test selectors');
    
    console.log('\n7. SELF HEALING ENABLED:');
    console.log('   Type: Boolean');
    console.log('   Value:', script.selfHealingEnabled);
    
    console.log('\n' + '═'.repeat(60));
    console.log('\n💾 Complete Database Schema for Script:\n');
    console.log('  - id: UUID (auto-generated)');
    console.log('  - name: String (required)');
    console.log('  - description: String (optional)');
    console.log('  - language: String (default: typescript)');
    console.log('  - code: TEXT (required - full Playwright script)');
    console.log('  - projectId: UUID (optional, foreign key)');
    console.log('  - userId: UUID (required, foreign key)');
    console.log('  - browserType: String (default: chromium)');
    console.log('  - viewport: JSON (optional)');
    console.log('  - testIdAttribute: String (default: data-testid)');
    console.log('  - selfHealingEnabled: Boolean (default: true)');
    console.log('  - createdAt: DateTime (auto)');
    console.log('  - updatedAt: DateTime (auto)');
    console.log('\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

viewScriptFormat();
