import pool from '../src/db';

async function setupTestDatabase() {
  console.log('Setting up test database...');

  try {
    await pool.query('DELETE FROM "TestDataRow"');
    await pool.query('DELETE FROM "TestDataFile"');
    await pool.query('DELETE FROM "SelfHealingLocator"');
    await pool.query('DELETE FROM "LocatorStrategy"');
    await pool.query('DELETE FROM "Variable"');
    await pool.query('DELETE FROM "Breakpoint"');
    await pool.query('DELETE FROM "TestStep"');
    await pool.query('DELETE FROM "TestRun"');
    await pool.query('DELETE FROM "Script"');
    await pool.query('DELETE FROM "Project"');
    await pool.query('DELETE FROM "ExtensionScript"');
    await pool.query('DELETE FROM "RefreshToken"');
    await pool.query('DELETE FROM "User"');

    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error setting up test database:', error);
  }
}

setupTestDatabase().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
