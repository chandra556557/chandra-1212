import { Router } from 'express';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  createSuite,
  getSuites,
  getSuite,
  updateSuite,
  deleteSuite,
  createTestCase,
  getTestCases,
  executeTestCase,
  executeTestCaseWithTestData,
  createContract,
  getContracts,
  createMock,
  getMocks,
  getBenchmarks,
  getBenchmarkStats,
  suggestAssertions,
} from '../controllers/apiTesting.controller';

const router = Router();

// ========== Test Suite Routes ==========
router.post('/suites', authMiddleware, createSuite);
router.get('/suites', authMiddleware, getSuites);
router.get('/suites/:id', authMiddleware, getSuite);
router.put('/suites/:id', authMiddleware, updateSuite);
router.delete('/suites/:id', authMiddleware, deleteSuite);

// ========== Test Case Routes ==========
router.post('/test-cases', authMiddleware, createTestCase);
router.get('/suites/:suiteId/test-cases', authMiddleware, getTestCases);
router.post('/test-cases/:id/execute', authMiddleware, executeTestCase);
router.post('/test-cases/:id/execute-with-testdata', authMiddleware, executeTestCaseWithTestData);

// ========== Contract Routes ==========
router.post('/contracts', authMiddleware, createContract);
router.get('/suites/:suiteId/contracts', authMiddleware, getContracts);

// ========== Mock Routes ==========
router.post('/mocks', authMiddleware, createMock);
router.get('/suites/:suiteId/mocks', authMiddleware, getMocks);

// ========== Performance Benchmark Routes ==========
router.get('/test-cases/:testCaseId/benchmarks', authMiddleware, getBenchmarks);
router.get('/test-cases/:testCaseId/benchmarks/stats', authMiddleware, getBenchmarkStats);

// ========== AI-Assisted Assertion Suggestions ==========
router.post('/ai/assertions/suggest', authMiddleware, suggestAssertions);

router.post('/python/assertions/suggest', authMiddleware, async (req, res) => {
  const traceId = Math.random().toString(36).slice(2);
  try {
    const apiUrl = process.env.PYTHON_API_URL || 'http://34.46.36.105:3000/genieapi';
    const timeout = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.PYTHON_API_TOKEN) {
      const t = process.env.PYTHON_API_TOKEN;
      headers['Authorization'] = t.startsWith('Bearer') ? t : `Bearer ${t}`;
    }
    const root = apiUrl.replace(/\/assistant\/generate-test-data$/, '').replace(/\/+$/, '');
    const client = axios.create({ timeout, headers });
    const fullUrl = root + '/api-testing/assertions/suggest';
    logger.info('Forwarding assertion suggestion request to Python API', { traceId });
    const response = await client.post(fullUrl, req.body);
    return res.status(response.status || 200).json({ traceId, ...response.data });
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status ?? 502;
    const data = err.response?.data ?? { message: err.message || 'Upstream error' };
    logger.error('Python API error while suggesting assertions', { traceId, status, data });
    return res.status(status).json({ error: 'UpstreamError', traceId, ...(typeof data === 'object' ? data : { message: String(data) }) });
  }
});

router.post('/python/tests/execute', authMiddleware, async (req, res) => {
  const traceId = Math.random().toString(36).slice(2);
  try {
    const apiUrl = process.env.PYTHON_API_URL || 'http://34.46.36.105:3000/genieapi';
    const timeout = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.PYTHON_API_TOKEN) {
      const t = process.env.PYTHON_API_TOKEN;
      headers['Authorization'] = t.startsWith('Bearer') ? t : `Bearer ${t}`;
    }
    const root = apiUrl.replace(/\/assistant\/generate-test-data$/, '').replace(/\/+$/, '');
    const client = axios.create({ timeout, headers });
    const fullUrl = root + '/api-testing/tests/execute';
    logger.info('Forwarding test execute request to Python API', { traceId });
    const response = await client.post(fullUrl, req.body);
    return res.status(response.status || 200).json({ traceId, ...response.data });
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status ?? 502;
    const data = err.response?.data ?? { message: err.message || 'Upstream error' };
    logger.error('Python API error while executing tests', { traceId, status, data });
    return res.status(status).json({ error: 'UpstreamError', traceId, ...(typeof data === 'object' ? data : { message: String(data) }) });
  }
});

router.post('/python/contracts/validate', authMiddleware, async (req, res) => {
  const traceId = Math.random().toString(36).slice(2);
  try {
    const apiUrl = process.env.PYTHON_API_URL || 'http://34.46.36.105:3000/genieapi';
    const timeout = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.PYTHON_API_TOKEN) {
      const t = process.env.PYTHON_API_TOKEN;
      headers['Authorization'] = t.startsWith('Bearer') ? t : `Bearer ${t}`;
    }
    const root = apiUrl.replace(/\/assistant\/generate-test-data$/, '').replace(/\/+$/, '');
    const client = axios.create({ timeout, headers });
    const fullUrl = root + '/api-testing/contracts/validate';
    logger.info('Forwarding contract validate request to Python API', { traceId });
    const response = await client.post(fullUrl, req.body);
    return res.status(response.status || 200).json({ traceId, ...response.data });
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status ?? 502;
    const data = err.response?.data ?? { message: err.message || 'Upstream error' };
    logger.error('Python API error while validating contracts', { traceId, status, data });
    return res.status(status).json({ error: 'UpstreamError', traceId, ...(typeof data === 'object' ? data : { message: String(data) }) });
  }
});

router.post('/python/mocks/generate', authMiddleware, async (req, res) => {
  const traceId = Math.random().toString(36).slice(2);
  try {
    const apiUrl = process.env.PYTHON_API_URL || 'http://34.46.36.105:3000/genieapi';
    const timeout = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (process.env.PYTHON_API_TOKEN) {
      const t = process.env.PYTHON_API_TOKEN;
      headers['Authorization'] = t.startsWith('Bearer') ? t : `Bearer ${t}`;
    }
    const root = apiUrl.replace(/\/assistant\/generate-test-data$/, '').replace(/\/+$/, '');
    const client = axios.create({ timeout, headers });
    const fullUrl = root + '/api-testing/mocks/generate';
    logger.info('Forwarding mock generate request to Python API', { traceId });
    const response = await client.post(fullUrl, req.body);
    return res.status(response.status || 200).json({ traceId, ...response.data });
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status ?? 502;
    const data = err.response?.data ?? { message: err.message || 'Upstream error' };
    logger.error('Python API error while generating mocks', { traceId, status, data });
    return res.status(status).json({ error: 'UpstreamError', traceId, ...(typeof data === 'object' ? data : { message: String(data) }) });
  }
});

export default router;
