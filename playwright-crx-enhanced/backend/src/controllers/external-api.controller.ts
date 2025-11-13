/**
 * External API Integration Controller
 */

import { Request, Response } from 'express';
import { ExternalAPIService } from '../services/external-api.service';

const externalAPIService = new ExternalAPIService();

/**
 * Create API configuration
 */
export const createAPIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { name, apiType, endpoint, method, headers, authType, authConfig, requestTemplate, responseMapping, isActive } = req.body;

    if (!name || !endpoint || !method) {
      res.status(400).json({
        success: false,
        message: 'name, endpoint, and method are required'
      });
      return;
    }

    const config = await externalAPIService.createConfig(userId, {
      name,
      apiType: apiType || 'rest',
      endpoint,
      method: method.toUpperCase(),
      headers,
      authType,
      authConfig,
      requestTemplate,
      responseMapping,
      isActive: isActive !== false
    });

    res.status(201).json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('Create API config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create API configuration',
      error: error.message
    });
  }
};

/**
 * Get all API configurations
 */
export const getAPIConfigs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const configs = await externalAPIService.getConfigs(userId);

    res.json({
      success: true,
      data: configs
    });
  } catch (error: any) {
    console.error('Get API configs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API configurations',
      error: error.message
    });
  }
};

/**
 * Get API configuration by ID
 */
export const getAPIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const config = await externalAPIService.getConfigById(userId, id);

    if (!config) {
      res.status(404).json({
        success: false,
        message: 'API configuration not found'
      });
      return;
    }

    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('Get API config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API configuration',
      error: error.message
    });
  }
};

/**
 * Update API configuration
 */
export const updateAPIConfig = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const updates = req.body;

    const config = await externalAPIService.updateConfig(userId, id, updates);

    res.json({
      success: true,
      data: config
    });
  } catch (error: any) {
    console.error('Update API config error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update API configuration',
      error: error.message
    });
  }
};

/**
 * Delete API configuration
 */
export const deleteAPIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const deleted = await externalAPIService.deleteConfig(userId, id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'API configuration not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'API configuration deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete API config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete API configuration',
      error: error.message
    });
  }
};

/**
 * Execute API call
 */
export const executeAPICall = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { configId, data, overrides } = req.body;

    if (!configId) {
      res.status(400).json({
        success: false,
        message: 'configId is required'
      });
      return;
    }

    const result = await externalAPIService.executeCall(userId, {
      configId,
      data,
      overrides
    });

    res.json(result);
  } catch (error: any) {
    console.error('Execute API call error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute API call',
      error: error.message
    });
  }
};

/**
 * Get call logs
 */
export const getAPICallLogs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { configId, limit = 50 } = req.query;

    const logs = await externalAPIService.getCallLogs(
      userId,
      configId as string | undefined,
      Number(limit)
    );

    res.json({
      success: true,
      data: logs
    });
  } catch (error: any) {
    console.error('Get API call logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch call logs',
      error: error.message
    });
  }
};

/**
 * Test API configuration (execute without saving)
 */
export const testAPIConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { endpoint, method, headers, authType, authConfig, data } = req.body;

    if (!endpoint || !method) {
      res.status(400).json({
        success: false,
        message: 'endpoint and method are required'
      });
      return;
    }

    // Create temporary config
    const tempConfig = await externalAPIService.createConfig(userId, {
      name: '__TEMP_TEST__',
      apiType: 'rest',
      endpoint,
      method,
      headers,
      authType,
      authConfig,
      isActive: true
    });

    // Execute call
    const result = await externalAPIService.executeCall(userId, {
      configId: tempConfig.id,
      data
    });

    // Delete temporary config
    await externalAPIService.deleteConfig(userId, tempConfig.id);

    res.json(result);
  } catch (error: any) {
    console.error('Test API config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test API configuration',
      error: error.message
    });
  }
};
