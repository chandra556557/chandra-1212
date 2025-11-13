/**
 * ML Enhancement Controller
 * API endpoints for ML-powered script enhancement
 */

import { Request, Response } from 'express';
import { mlEnhancementService } from '../services/ml-enhancement.service';
import pool from '../db';

/**
 * POST /api/ml/enhance-script/:id
 * Enhance a script using ML
 */
export const enhanceScriptWithML = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;

    // Get script
    const { rows } = await pool.query(
      `SELECT id, name, code, language FROM "Script" WHERE id = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (!rows.length) {
      res.status(404).json({
        success: false,
        error: 'Script not found'
      });
      return;
    }

    const script = rows[0];

    // Enhance with ML
    const result = await mlEnhancementService.enhanceScript(
      script.code,
      script.language || 'typescript'
    );

    res.status(200).json({
      success: true,
      data: {
        scriptId: script.id,
        scriptName: script.name,
        ...result
      }
    });
  } catch (error: any) {
    console.error('ML enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enhance script with ML'
    });
  }
};

/**
 * POST /api/ml/enhance-code
 * Enhance arbitrary code (not saved)
 */
export const enhanceCodeWithML = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, language } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        error: 'Code is required'
      });
      return;
    }

    // Enhance with ML
    const result = await mlEnhancementService.enhanceScript(
      code,
      language || 'typescript'
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('ML enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enhance code with ML'
    });
  }
};

/**
 * POST /api/ml/batch-enhance
 * Batch enhance multiple scripts
 */
export const batchEnhanceWithML = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const { scriptIds } = req.body;

    if (!scriptIds || !Array.isArray(scriptIds) || scriptIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'scriptIds array is required'
      });
      return;
    }

    if (scriptIds.length > 50) {
      res.status(400).json({
        success: false,
        error: 'Maximum 50 scripts per batch'
      });
      return;
    }

    // Get scripts
    const placeholders = scriptIds.map((_, i) => `$${i + 2}`).join(',');
    const { rows } = await pool.query(
      `SELECT id, name, code, language FROM "Script" 
       WHERE id IN (${placeholders}) AND "userId" = $1`,
      [userId, ...scriptIds]
    );

    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        error: 'No scripts found'
      });
      return;
    }

    // Enhance all scripts
    const results = await Promise.all(
      rows.map(async (script) => {
        try {
          const enhancement = await mlEnhancementService.enhanceScript(
            script.code,
            script.language || 'typescript'
          );
          return {
            scriptId: script.id,
            scriptName: script.name,
            ...enhancement
          };
        } catch (error: any) {
          return {
            scriptId: script.id,
            scriptName: script.name,
            success: false,
            error: error.message
          };
        }
      })
    );

    // Summary
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalSuggestions: results
        .filter(r => r.success)
        .reduce((sum, r) => sum + ((r as any).summary?.totalSuggestions || 0), 0)
    };

    res.status(200).json({
      success: true,
      data: {
        results,
        summary
      }
    });
  } catch (error: any) {
    console.error('Batch ML enhancement error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to batch enhance scripts'
    });
  }
};

/**
 * GET /api/ml/status
 * Get ML service status
 */
export const getMLStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        enabled: true,
        type: 'TensorFlow.js + AST Analysis',
        features: [
          'Pattern Recognition',
          'Code Complexity Analysis',
          'Intelligent Prioritization',
          'AST-based Detection',
          'Multi-category Enhancement'
        ],
        capabilities: {
          selector: true,
          wait: true,
          assertion: true,
          bestPractice: true,
          errorHandling: true,
          performance: true
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
