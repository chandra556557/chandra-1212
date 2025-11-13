import express from 'express';
import axios, { AxiosError } from 'axios';
import { logger } from '../utils/logger';

const router = express.Router();

// Python API configuration
const PYTHON_API_BASE_URL = 'http://34.46.36.105:3000/genieapi';
const PYTHON_API_TIMEOUT = parseInt(process.env.PYTHON_API_TIMEOUT || '30000');

// Create axios instance for Python API
const pythonApiClient = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  timeout: PYTHON_API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
pythonApiClient.interceptors.request.use((config) => {
  logger.info(`Python API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    method: config.method,
    url: config.url,
    data: config.data,
  });
  return config;
});

// Response interceptor for logging
pythonApiClient.interceptors.response.use(
  (response) => {
    logger.info(`Python API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    logger.error(`Python API Error: ${error.response?.status} ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

// Example: Proxy endpoint for Python ML predictions
router.post('/predict', async (req, res) => {
  try {
    const { testData, modelType } = req.body;
    
    if (!testData) {
      return res.status(400).json({ 
        error: 'testData is required',
        timestamp: new Date().toISOString()
      });
    }

    // Forward request to Python API
    const response = await pythonApiClient.post('/api/ml/predict', {
      testData,
      modelType
    });

    return res.status(response.status || 200).json(response.data);
  } catch (error) {
    const err = error as AxiosError;
    const status = err.response?.status ?? 502;
    const data = err.response?.data ?? { message: err.message || 'Upstream error' };
    return res.status(status).json(typeof data === 'object' ? data : { message: String(data) });
  }
});

export default router;
     
