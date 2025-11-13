import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import pool from '../db';
import { randomUUID } from 'crypto';

/**
 * Get all test suites for a user
 */
export const getTestSuites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const { rows } = await pool.query(
      `SELECT * FROM "TestSuite" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );

    res.status(200).json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get test suites' });
  }
};

/**
 * Create a test suite
 */
export const createTestSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description } = req.body;

    if (!name) throw new AppError('Suite name is required', 400);

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "TestSuite" (id, name, description, "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, now(), now())
       RETURNING *`,
      [id, name, description || null, userId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create test suite' });
    }
  }
};

/**
 * Update a test suite
 */
export const updateTestSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await pool.query(
      `SELECT id FROM "TestSuite" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test suite not found', 404);

    const { rows } = await pool.query(
      `UPDATE "TestSuite"
       SET name = COALESCE($2, name),
           description = COALESCE($3, description),
           "updatedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [id, name || null, description || null]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update test suite' });
    }
  }
};

/**
 * Delete a test suite
 */
export const deleteTestSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT id FROM "TestSuite" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test suite not found', 404);

    await pool.query(`DELETE FROM "TestSuite" WHERE id = $1`, [id]);

    res.status(200).json({ success: true, message: 'Test suite deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete test suite' });
    }
  }
};

/**
 * Get all test data (optionally filtered by suite)
 */
export const getTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { suiteId, environment, type } = req.query;

    let query = `SELECT td.*, ts.name as "suiteName"
                 FROM "TestData" td
                 JOIN "TestSuite" ts ON ts.id = td."suiteId"
                 WHERE ts."userId" = $1`;
    const params: any[] = [userId];
    let paramCount = 1;

    if (suiteId) {
      paramCount++;
      query += ` AND td."suiteId" = $${paramCount}`;
      params.push(suiteId);
    }

    if (environment) {
      paramCount++;
      query += ` AND td.environment = $${paramCount}`;
      params.push(environment);
    }

    if (type) {
      paramCount++;
      query += ` AND td.type = $${paramCount}`;
      params.push(type);
    }

    query += ` ORDER BY td."createdAt" DESC`;

    const { rows } = await pool.query(query, params);

    res.status(200).json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get test data' });
  }
};

/**
 * Create test data
 */
export const createTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { suiteId, name, environment, type, data } = req.body;

    if (!suiteId || !name || !data) {
      throw new AppError('suiteId, name, and data are required', 400);
    }

    // Verify suite belongs to user
    const suiteCheck = await pool.query(
      `SELECT id FROM "TestSuite" WHERE id = $1 AND "userId" = $2`,
      [suiteId, userId]
    );

    if (!suiteCheck.rowCount) throw new AppError('Test suite not found', 404);

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "TestData" (id, "suiteId", name, environment, type, data, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, now(), now())
       RETURNING *`,
      [id, suiteId, name, environment || 'dev', type || 'user', JSON.stringify(data)]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create test data' });
    }
  }
};

/**
 * Update test data
 */
export const updateTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, environment, type, data } = req.body;

    // Verify ownership through suite
    const existing = await pool.query(
      `SELECT td.id FROM "TestData" td
       JOIN "TestSuite" ts ON ts.id = td."suiteId"
       WHERE td.id = $1 AND ts."userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test data not found', 404);

    const { rows } = await pool.query(
      `UPDATE "TestData"
       SET name = COALESCE($2, name),
           environment = COALESCE($3, environment),
           type = COALESCE($4, type),
           data = COALESCE($5, data),
           "updatedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [id, name || null, environment || null, type || null, data ? JSON.stringify(data) : null]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update test data' });
    }
  }
};

/**
 * Delete test data
 */
export const deleteTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Verify ownership through suite
    const existing = await pool.query(
      `SELECT td.id FROM "TestData" td
       JOIN "TestSuite" ts ON ts.id = td."suiteId"
       WHERE td.id = $1 AND ts."userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('Test data not found', 404);

    await pool.query(`DELETE FROM "TestData" WHERE id = $1`, [id]);

    res.status(200).json({ success: true, message: 'Test data deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete test data' });
    }
  }
};
