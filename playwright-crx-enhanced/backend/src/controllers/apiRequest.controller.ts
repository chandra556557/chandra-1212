import { Request, Response } from 'express';
import { AppError } from '../middleware/errorHandler';
import pool from '../db';
import { randomUUID } from 'crypto';

/**
 * Get all API requests for a user
 */
export const getApiRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { environment } = req.query;

    let query = `SELECT * FROM "ApiRequest" WHERE "userId" = $1`;
    const params: any[] = [userId];

    if (environment) {
      query += ` AND environment = $2`;
      params.push(environment);
    }

    query += ` ORDER BY "createdAt" DESC`;

    const { rows } = await pool.query(query, params);

    res.status(200).json({ success: true, data: rows });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get API requests' });
  }
};

/**
 * Get a specific API request
 */
export const getApiRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM "ApiRequest" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!rows.length) throw new AppError('API request not found', 404);

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to get API request' });
    }
  }
};

/**
 * Create an API request
 */
export const createApiRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, method, url, headers, body, environment } = req.body;

    if (!name || !method || !url) {
      throw new AppError('name, method, and url are required', 400);
    }

    const id = randomUUID();
    const { rows } = await pool.query(
      `INSERT INTO "ApiRequest" (id, "userId", name, method, url, headers, body, environment, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
       RETURNING *`,
      [
        id,
        userId,
        name,
        method.toUpperCase(),
        url,
        headers ? JSON.stringify(headers) : null,
        body ? JSON.stringify(body) : null,
        environment || 'dev'
      ]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create API request' });
    }
  }
};

/**
 * Update an API request
 */
export const updateApiRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { name, method, url, headers, body, environment } = req.body;

    const existing = await pool.query(
      `SELECT id FROM "ApiRequest" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('API request not found', 404);

    const { rows } = await pool.query(
      `UPDATE "ApiRequest"
       SET name = COALESCE($2, name),
           method = COALESCE($3, method),
           url = COALESCE($4, url),
           headers = COALESCE($5, headers),
           body = COALESCE($6, body),
           environment = COALESCE($7, environment),
           "updatedAt" = now()
       WHERE id = $1
       RETURNING *`,
      [
        id,
        name || null,
        method ? method.toUpperCase() : null,
        url || null,
        headers !== undefined ? JSON.stringify(headers) : null,
        body !== undefined ? JSON.stringify(body) : null,
        environment || null
      ]
    );

    res.status(200).json({ success: true, data: rows[0] });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update API request' });
    }
  }
};

/**
 * Delete an API request
 */
export const deleteApiRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    const existing = await pool.query(
      `SELECT id FROM "ApiRequest" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!existing.rowCount) throw new AppError('API request not found', 404);

    await pool.query(`DELETE FROM "ApiRequest" WHERE id = $1`, [id]);

    res.status(200).json({ success: true, message: 'API request deleted successfully' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete API request' });
    }
  }
};
