/**
 * External API Integration Service
 * Connect to other backends and integrate responses
 */

import axios, { AxiosRequestConfig, Method } from 'axios';
import pool from '../db';
import { randomUUID } from 'crypto';

export interface ExternalAPIConfig {
  id: string;
  name: string;
  apiType: string;
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  authType?: 'none' | 'bearer' | 'basic' | 'apikey';
  authConfig?: {
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  requestTemplate?: Record<string, any>;
  responseMapping?: Record<string, string>;
  userId: string;
  isActive: boolean;
}

export interface APICallRequest {
  configId: string;
  data?: Record<string, any>;
  overrides?: {
    endpoint?: string;
    headers?: Record<string, string>;
  };
}

export interface APICallResponse {
  success: boolean;
  data?: any;
  rawResponse?: any;
  statusCode: number;
  duration: number;
  error?: string;
  callLogId?: string;
}

export class ExternalAPIService {
  /**
   * Execute API call
   */
  async executeCall(userId: string, request: APICallRequest): Promise<APICallResponse> {
    const startTime = Date.now();
    let config: ExternalAPIConfig | null = null;
    let statusCode = 0;
    let responseData: any = null;

    try {
      // Get API configuration
      const configResult = await pool.query(
        `SELECT * FROM "ExternalAPIConfig" WHERE id = $1 AND "userId" = $2 AND "isActive" = true`,
        [request.configId, userId]
      );

      if (configResult.rows.length === 0) {
        throw new Error('API configuration not found or inactive');
      }

      config = configResult.rows[0];
      
      if (!config) {
        throw new Error('Config is null');
      }

      // Build request
      const axiosConfig = this.buildAxiosConfig(config, request);

      // Execute call
      const response = await axios(axiosConfig);
      statusCode = response.status;
      responseData = response.data;

      // Apply response mapping if configured
      const mappedData = this.applyResponseMapping(responseData, config.responseMapping);

      const duration = Date.now() - startTime;

      // Log the call
      const callLogId = await this.logAPICall({
        configId: config.id,
        userId,
        endpoint: axiosConfig.url || '',
        method: axiosConfig.method || 'GET',
        requestBody: request.data,
        responseBody: responseData,
        statusCode,
        duration,
        success: true
      });

      return {
        success: true,
        data: mappedData,
        rawResponse: responseData,
        statusCode,
        duration,
        callLogId
      };

    } catch (err: any) {
      const duration = Date.now() - startTime;
      statusCode = err.response?.status || 0;
      const errorMessage = err.message;

      // Log failed call
      const callLogId = await this.logAPICall({
        configId: request.configId,
        userId,
        endpoint: config?.endpoint || 'unknown',
        method: config?.method || 'GET',
        requestBody: request.data,
        responseBody: err.response?.data,
        statusCode,
        duration,
        success: false,
        error: errorMessage
      });

      return {
        success: false,
        statusCode,
        duration,
        error: errorMessage,
        rawResponse: err.response?.data,
        callLogId
      };
    }
  }

  /**
   * Build Axios configuration
   */
  private buildAxiosConfig(config: ExternalAPIConfig, request: APICallRequest): AxiosRequestConfig {
    const axiosConfig: AxiosRequestConfig = {
      url: request.overrides?.endpoint || config.endpoint,
      method: config.method.toUpperCase() as Method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...request.overrides?.headers
      },
      timeout: 30000
    };

    // Add authentication
    if (config.authType && config.authConfig) {
      switch (config.authType) {
        case 'bearer':
          axiosConfig.headers!['Authorization'] = `Bearer ${config.authConfig.token}`;
          break;
        case 'basic':
          const credentials = Buffer.from(`${config.authConfig.username}:${config.authConfig.password}`).toString('base64');
          axiosConfig.headers!['Authorization'] = `Basic ${credentials}`;
          break;
        case 'apikey':
          const headerName = config.authConfig.apiKeyHeader || 'X-API-Key';
          axiosConfig.headers![headerName] = config.authConfig.apiKey || '';
          break;
      }
    }

    // Add request body
    if (['POST', 'PUT', 'PATCH'].includes(config.method.toUpperCase())) {
      if (config.requestTemplate) {
        // Merge template with provided data
        axiosConfig.data = this.mergeRequestData(config.requestTemplate, request.data || {});
      } else {
        axiosConfig.data = request.data;
      }
    } else if (request.data) {
      // For GET/DELETE, add as query params
      axiosConfig.params = request.data;
    }

    return axiosConfig;
  }

  /**
   * Merge request template with data
   */
  private mergeRequestData(template: Record<string, any>, data: Record<string, any>): any {
    const merged = { ...template };

    for (const [key, value] of Object.entries(data)) {
      // Support nested keys like "user.name"
      const parts = key.split('.');
      let current: any = merged;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
    }

    return merged;
  }

  /**
   * Apply response mapping
   */
  private applyResponseMapping(response: any, mapping?: Record<string, string>): any {
    if (!mapping || Object.keys(mapping).length === 0) {
      return response;
    }

    const mapped: any = {};

    for (const [targetKey, sourcePath] of Object.entries(mapping)) {
      const value = this.getNestedValue(response, sourcePath);
      if (value !== undefined) {
        mapped[targetKey] = value;
      }
    }

    return mapped;
  }

  /**
   * Get nested value from object using path
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) {
        return undefined;
      }
      current = current[part];
    }

    return current;
  }

  /**
   * Log API call
   */
  private async logAPICall(log: {
    configId: string;
    userId: string;
    endpoint: string;
    method: string;
    requestBody?: any;
    responseBody?: any;
    statusCode: number;
    duration: number;
    success: boolean;
    error?: string;
  }): Promise<string> {
    try {
      const id = randomUUID();
      await pool.query(
        `INSERT INTO "APICallLog" (id, "configId", "userId", endpoint, method, "requestBody", "responseBody", "statusCode", duration, success, error, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
        [
          id,
          log.configId,
          log.userId,
          log.endpoint,
          log.method,
          log.requestBody ? JSON.stringify(log.requestBody) : null,
          log.responseBody ? JSON.stringify(log.responseBody) : null,
          log.statusCode,
          log.duration,
          log.success,
          log.error || null
        ]
      );
      return id;
    } catch (err) {
      console.error('Failed to log API call:', err);
      return '';
    }
  }

  /**
   * Create API configuration
   */
  async createConfig(userId: string, config: Omit<ExternalAPIConfig, 'id' | 'userId'>): Promise<ExternalAPIConfig> {
    const id = randomUUID();
    
    const result = await pool.query(
      `INSERT INTO "ExternalAPIConfig" (id, name, "apiType", endpoint, method, headers, "authType", "authConfig", "requestTemplate", "responseMapping", "userId", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       RETURNING *`,
      [
        id,
        config.name,
        config.apiType,
        config.endpoint,
        config.method,
        config.headers ? JSON.stringify(config.headers) : null,
        config.authType || 'none',
        config.authConfig ? JSON.stringify(config.authConfig) : null,
        config.requestTemplate ? JSON.stringify(config.requestTemplate) : null,
        config.responseMapping ? JSON.stringify(config.responseMapping) : null,
        userId,
        config.isActive !== false
      ]
    );

    return result.rows[0];
  }

  /**
   * Get all configurations for user
   */
  async getConfigs(userId: string): Promise<ExternalAPIConfig[]> {
    const result = await pool.query(
      `SELECT * FROM "ExternalAPIConfig" WHERE "userId" = $1 ORDER BY "createdAt" DESC`,
      [userId]
    );

    return result.rows;
  }

  /**
   * Get configuration by ID
   */
  async getConfigById(userId: string, configId: string): Promise<ExternalAPIConfig | null> {
    const result = await pool.query(
      `SELECT * FROM "ExternalAPIConfig" WHERE id = $1 AND "userId" = $2`,
      [configId, userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  /**
   * Update configuration
   */
  async updateConfig(userId: string, configId: string, updates: Partial<ExternalAPIConfig>): Promise<ExternalAPIConfig> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    const allowedFields = ['name', 'apiType', 'endpoint', 'method', 'headers', 'authType', 'authConfig', 'requestTemplate', 'responseMapping', 'isActive'];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`"${key}" = $${paramIndex++}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(configId, userId);
    const result = await pool.query(
      `UPDATE "ExternalAPIConfig" SET ${fields.join(', ')}, "updatedAt" = NOW()
       WHERE id = $${paramIndex++} AND "userId" = $${paramIndex++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error('Configuration not found');
    }

    return result.rows[0];
  }

  /**
   * Delete configuration
   */
  async deleteConfig(userId: string, configId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM "ExternalAPIConfig" WHERE id = $1 AND "userId" = $2`,
      [configId, userId]
    );

    return result.rowCount! > 0;
  }

  /**
   * Get call logs
   */
  async getCallLogs(userId: string, configId?: string, limit: number = 50): Promise<any[]> {
    let sqlQuery = `SELECT * FROM "APICallLog" WHERE "userId" = $1`;
    const params: any[] = [userId];

    if (configId) {
      params.push(configId);
      sqlQuery += ` AND "configId" = $2`;
    }

    sqlQuery += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(sqlQuery, params);
    return result.rows;
  }
}
