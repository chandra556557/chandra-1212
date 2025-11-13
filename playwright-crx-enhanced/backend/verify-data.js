const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/playwright_crx1'
});

async function verify() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'passed' THEN 1 END) as passed,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error
      FROM "TestRun"
    `);
    
    console.log('✅ Test Runs Summary:');
    console.log(result.rows[0]);
    
    const errorSample = await pool.query(`
      SELECT status, "errorMsg" 
      FROM "TestRun" 
      WHERE status IN ('failed', 'error')
      LIMIT 10
    `);
    
    console.log('\n📋 Error Messages Sample:');
    errorSample.rows.forEach((r, i) => {
      console.log(`${i+1}. [${r.status}] ${r.errorMsg || 'No error message'}`);
    });
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

verify();
