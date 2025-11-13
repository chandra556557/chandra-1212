import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getTestSuites,
  createTestSuite,
  updateTestSuite,
  deleteTestSuite,
  getTestData,
  createTestData,
  updateTestData,
  deleteTestData
} from '../controllers/testData.controller';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Test Suite routes
router.get('/suites', getTestSuites);
router.post('/suites', createTestSuite);
router.put('/suites/:id', updateTestSuite);
router.delete('/suites/:id', deleteTestSuite);

// Test Data routes
router.get('/data', getTestData);
router.post('/data', createTestData);
router.put('/data/:id', updateTestData);
router.delete('/data/:id', deleteTestData);

export default router;
