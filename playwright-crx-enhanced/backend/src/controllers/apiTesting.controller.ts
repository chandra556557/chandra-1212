import { Request, Response } from 'express';
import { apiTestingService } from '../services/apiTesting/apiTesting.service';
import { AppError } from '../middleware/errorHandler';
import axios, { AxiosError } from 'axios';

// ========== Test Suites ==========

export const createSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, description, baseUrl, headers, authConfig } = req.body;

    if (!name) {
      throw new AppError('Name is required', 400);
    }

    const suite = await apiTestingService.createSuite({
      name,
      description,
      userId,
      baseUrl,
      headers,
      authConfig,
    });

    res.status(201).json({ success: true, data: suite });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create suite' });
    }
  }
};

export const getSuites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const suites = await apiTestingService.getSuites(userId);
    res.status(200).json({ success: true, data: suites });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get suites' });
  }
};

export const getSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    
    const suite = await apiTestingService.getSuite(parseInt(id), userId);
    if (!suite) {
      throw new AppError('Suite not found', 404);
    }

    res.status(200).json({ success: true, data: suite });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to get suite' });
    }
  }
};

export const updateSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    
    const suite = await apiTestingService.updateSuite(parseInt(id), userId, req.body);
    if (!suite) {
      throw new AppError('Suite not found', 404);
    }

    res.status(200).json({ success: true, data: suite });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to update suite' });
    }
  }
};

export const deleteSuite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    
    const deleted = await apiTestingService.deleteSuite(parseInt(id), userId);
    if (!deleted) {
      throw new AppError('Suite not found', 404);
    }

    res.status(200).json({ success: true, message: 'Suite deleted' });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to delete suite' });
    }
  }
};

// ========== Test Cases ==========

export const createTestCase = async (req: Request, res: Response) => {
  try {
    const { suiteId, name, method, endpoint, description, headers, body, expectedStatus, assertions } = req.body;

    if (!suiteId || !name || !method || !endpoint) {
      throw new AppError('SuiteId, name, method, and endpoint are required', 400);
    }

    const testCase = await apiTestingService.createTestCase({
      suiteId,
      name,
      method,
      endpoint,
      description,
      headers,
      body,
      expectedStatus,
      assertions,
    });

    res.status(201).json({ success: true, data: testCase });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create test case' });
    }
  }
};

export const getTestCases = async (req: Request, res: Response) => {
  try {
    const { suiteId } = req.params;
    const testCases = await apiTestingService.getTestCases(parseInt(suiteId));
    res.status(200).json({ success: true, data: testCases });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get test cases' });
  }
};

export const executeTestCase = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    
    const result = await apiTestingService.executeTestCase(parseInt(id), userId);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to execute test case' });
  }
};

export const executeTestCaseWithTestData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const { prompt, count, schema, bodyWrapper, headers: headerOverrides } = req.body || {};
    if (!prompt || typeof count !== 'number') {
      throw new AppError('prompt and count are required', 400);
    }
    const base = process.env.PYTHON_API_URL || 'http://34.46.36.105:3000/genieapi';
    const timeout = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const tok = process.env.PYTHON_API_TOKEN;
    if (tok) headers['Authorization'] = tok.startsWith('Bearer') ? tok : `Bearer ${tok}`;
    const fullUrl = base.includes('/assistant/generate-test-data') ? base : base.replace(/\/+$/, '') + '/assistant/generate-test-data';
    const genResp = await axios.post(fullUrl, { prompt, count, schema }, { timeout, headers });
    const generated = typeof genResp.data === 'object' && 'data' in genResp.data ? (genResp.data as any).data : genResp.data;
    let bodyOverride: any = generated;
    if (bodyWrapper && typeof bodyWrapper === 'object') bodyOverride = { ...bodyWrapper, data: generated };
    const result = await apiTestingService.executeTestCaseWithOverrides(parseInt(id), userId, { body: bodyOverride, headers: headerOverrides });
    res.status(200).json({ success: true, data: { generatedData: generated, execution: result } });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else if ((error as AxiosError).isAxiosError) {
      const e = error as AxiosError;
      res.status(e.response?.status || 502).json({ success: false, error: (e.response?.data as any)?.message || e.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to execute test case with test data' });
    }
  }
};

// ========== Contracts ==========

export const createContract = async (req: Request, res: Response) => {
  try {
    const { suiteId, name, version, contractType, contractData } = req.body;

    if (!suiteId || !name || !version || !contractType || !contractData) {
      throw new AppError('SuiteId, name, version, contractType, and contractData are required', 400);
    }

    const contract = await apiTestingService.createContract({
      suiteId,
      name,
      version,
      contractType,
      contractData,
    });

    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create contract' });
    }
  }
};

export const getContracts = async (req: Request, res: Response) => {
  try {
    const { suiteId } = req.params;
    const contracts = await apiTestingService.getContracts(parseInt(suiteId));
    res.status(200).json({ success: true, data: contracts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get contracts' });
  }
};

// ========== Mocks ==========

export const createMock = async (req: Request, res: Response) => {
  try {
    const { suiteId, name, endpoint, method, responseStatus, responseBody } = req.body;

    if (!suiteId || !name || !endpoint || !method) {
      throw new AppError('SuiteId, name, endpoint, and method are required', 400);
    }

    const mock = await apiTestingService.createMock({
      suiteId,
      name,
      endpoint,
      method,
      responseStatus,
      responseBody,
    });

    res.status(201).json({ success: true, data: mock });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to create mock' });
    }
  }
};

export const getMocks = async (req: Request, res: Response) => {
  try {
    const { suiteId } = req.params;
    const mocks = await apiTestingService.getMocks(parseInt(suiteId));
    res.status(200).json({ success: true, data: mocks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get mocks' });
  }
};

// ========== Performance Benchmarks ==========

export const getBenchmarks = async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    const benchmarks = await apiTestingService.getBenchmarks(parseInt(testCaseId), limit);
    res.status(200).json({ success: true, data: benchmarks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get benchmarks' });
  }
};

export const getBenchmarkStats = async (req: Request, res: Response) => {
  try {
    const { testCaseId } = req.params;
    
    const stats = await apiTestingService.getBenchmarkStats(parseInt(testCaseId));
    res.status(200).json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to get benchmark stats' });
  }
};

// ========== AI-Assisted Assertion Suggestions ==========

export const suggestAssertions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { responseBody, status, headers, method, endpoint, maxSuggestions } = req.body || {};

    if (responseBody === undefined || responseBody === null) {
      throw new AppError('responseBody is required', 400);
    }

    const suggestions = await apiTestingService.generateAssertionSuggestions({
      userId,
      responseBody,
      status,
      headers,
      method,
      endpoint,
      maxSuggestions,
    });

    res.status(200).json({ success: true, data: suggestions });
  } catch (error: any) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message || 'Failed to generate suggestions' });
    }
  }
};
