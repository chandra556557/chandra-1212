import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getScripts,
  getScript,
  createScript,
  updateScript,
  deleteScript,
  enhanceScript,
  applyEnhancement,
  getEnhancementForValidation,
  executeScript,
  batchEnhanceScripts
} from '../controllers/script.controller';

const router = Router();

// Get all scripts for a user
router.get('/', authMiddleware, getScripts);

// Get a specific script
router.get('/:id', authMiddleware, getScript);

// Create a new script
router.post('/', authMiddleware, createScript);

// Update a script
router.put('/:id', authMiddleware, updateScript);

// Delete a script
router.delete('/:id', authMiddleware, deleteScript);

// Enhance script with AI (POST to allow request body if needed)
router.post('/:id/enhance', authMiddleware, enhanceScript);

// Apply enhancement to script
router.post('/:id/apply-enhancement', authMiddleware, applyEnhancement);

// Get enhancement for validation
router.get('/:id/enhancement-for-validation', authMiddleware, getEnhancementForValidation);

// Execute a script
router.post('/:id/execute', authMiddleware, executeScript);

// Batch enhance multiple scripts
router.post('/batch/enhance', authMiddleware, batchEnhanceScripts);

export default router;
