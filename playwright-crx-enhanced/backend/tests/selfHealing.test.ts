import request from 'supertest';
import { app } from '../src/index';
import pool from '../src/db';

describe('Self-Healing API', () => {
  let authToken: string;
  let testUser: any;
  let testScript: any;

  beforeAll(async () => {
    const { rows: userRows } = await pool.query(
      `INSERT INTO "User" (id,email,password,name, "createdAt", "updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, now(), now())
       RETURNING id`,
      ['selfhealing@test.com', 'hashed-password', 'Self Healing Test User']
    );
    testUser = { id: userRows[0].id };

    const { rows: scriptRows } = await pool.query(
      `INSERT INTO "Script" (id,name,code,language,"userId","browserType","createdAt","updatedAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 'chromium', now(), now())
       RETURNING *`,
      ['Test Script', 'console.log("test");', 'javascript', testUser.id]
    );
    testScript = scriptRows[0];

    authToken = 'mock-auth-token';
  });

  afterAll(async () => {
    await pool.query('DELETE FROM "Script" WHERE "userId" = $1', [testUser.id]);
    await pool.query('DELETE FROM "User" WHERE email = $1', ['selfhealing@test.com']);
  });

  describe('POST /api/self-healing/record-failure', () => {
    it('should record a locator failure', async () => {
      await request(app)
        .post('/api/self-healing/record-failure')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scriptId: testScript.id,
          brokenLocator: {
            locator: '#broken-button',
            type: 'id'
          },
          validLocator: {
            locator: '.working-button',
            type: 'css'
          }
        })
        .expect(200);

      // Since the route is not implemented yet, we expect a 404
      // In a real implementation, this would test the actual functionality
    });
  });

  describe('GET /api/self-healing/suggestions/:scriptId', () => {
    it('should get self-healing suggestions for a script', async () => {
      await request(app)
        .get(`/api/self-healing/suggestions/${testScript.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Since the route is not implemented yet, we expect a 404
      // In a real implementation, this would test the actual functionality
    });
  });
});
