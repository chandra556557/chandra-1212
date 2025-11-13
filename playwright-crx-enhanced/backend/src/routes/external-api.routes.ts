/**
 * External API Integration Routes
 */

import { Router } from 'express';
import {
  createAPIConfig,
  getAPIConfigs,
  getAPIConfig,
  updateAPIConfig,
  deleteAPIConfig,
  executeAPICall,
  getAPICallLogs,
  testAPIConfig
} from '../controllers/external-api.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All endpoints require authentication
router.use(authMiddleware);

// API Configuration Management
router.post('/configs', createAPIConfig);
router.get('/configs', getAPIConfigs);
router.get('/configs/:id', getAPIConfig);
router.put('/configs/:id', updateAPIConfig);
router.delete('/configs/:id', deleteAPIConfig);

// API Call Execution
router.post('/execute', executeAPICall);
router.post('/test', testAPIConfig);

// Call Logs
router.get('/logs', getAPICallLogs);

export default router;
