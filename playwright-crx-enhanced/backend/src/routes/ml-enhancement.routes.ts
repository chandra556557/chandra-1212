/**
 * ML Enhancement Routes
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  enhanceScriptWithML,
  enhanceCodeWithML,
  batchEnhanceWithML,
  getMLStatus
} from '../controllers/ml-enhancement.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get ML service status
router.get('/status', getMLStatus);

// Enhance existing script by ID
router.post('/enhance-script/:id', enhanceScriptWithML);

// Enhance arbitrary code
router.post('/enhance-code', enhanceCodeWithML);

// Batch enhance multiple scripts
router.post('/batch-enhance', batchEnhanceWithML);

export default router;
