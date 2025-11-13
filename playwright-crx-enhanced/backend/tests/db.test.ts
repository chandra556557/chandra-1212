import pool from '../src/db';

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    const { rows } = await pool.query('SELECT 1 as ok');
    expect(rows[0].ok).toBe(1);
  });
});
