/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface TestDataFile {
  id: string;
  name: string;
  fileName: string;
  fileType: 'csv' | 'json';
  fileSize: number;
  createdAt: Date;
  rowCount: number;
  columnNames: string[];
}

export interface TestDataRow {
  rowNumber: number;
  data: Record<string, any>;
}

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, any>;
}

export class DDTService {
  private dataFiles: Map<string, TestDataFile> = new Map();
  private dataRows: Map<string, TestDataRow[]> = new Map();

  /**
   * Parse a CSV string
   */
  private parseCSV(text: string): { data: Array<Record<string, string>>; columns: string[] } {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      return { data: [], columns: [] };
    }

    // Parse header
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"(.*)"$/, '$1'));

    // Parse rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim().replace(/^"(.*)"$/, '$1'));
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return { data, columns: headers };
  }

  /**
   * Parse a JSON string
   */
  private parseJSON(text: string): { data: Array<Record<string, any>>; columns: string[] } {
    try {
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }

      if (data.length === 0) {
        return { data: [], columns: [] };
      }

      // Extract column names from first object
      const columns = Object.keys(data[0]);

      return { data, columns };
    } catch (error) {
      throw new Error(`JSON parsing error: ${error.message}`);
    }
  }

  /**
   * Upload and parse a CSV file
   */
  async uploadCSV(fileName: string, fileContent: string): Promise<TestDataFile> {
    try {
      // Parse CSV
      const { data: rows, columns } = this.parseCSV(fileContent);

      // Create test data file
      const fileId = Math.random().toString(36).substr(2, 9);
      const testDataFile: TestDataFile = {
        id: fileId,
        name: fileName.replace(/\.csv$/i, ''),
        fileName,
        fileType: 'csv',
        fileSize: fileContent.length,
        createdAt: new Date(),
        rowCount: rows.length,
        columnNames: columns
      };

      // Store file info
      this.dataFiles.set(fileId, testDataFile);

      // Create rows
      const rowsToCreate = rows.map((row, index) => ({
        rowNumber: index + 1,
        data: row
      }));

      // Store rows
      this.dataRows.set(fileId, rowsToCreate);

      // Save to chrome.storage for persistence
      await chrome.storage.local.set({
        [`ddt_file_${fileId}`]: testDataFile,
        [`ddt_rows_${fileId}`]: rowsToCreate
      });

      return testDataFile;
    } catch (error) {
      console.error('Error uploading CSV:', error);
      throw error;
    }
  }

  /**
   * Upload and parse a JSON file
   */
  async uploadJSON(fileName: string, fileContent: string): Promise<TestDataFile> {
    try {
      // Parse JSON
      const { data: rows, columns } = this.parseJSON(fileContent);

      // Create test data file
      const fileId = Math.random().toString(36).substr(2, 9);
      const testDataFile: TestDataFile = {
        id: fileId,
        name: fileName.replace(/\.json$/i, ''),
        fileName,
        fileType: 'json',
        fileSize: fileContent.length,
        createdAt: new Date(),
        rowCount: rows.length,
        columnNames: columns
      };

      // Store file info
      this.dataFiles.set(fileId, testDataFile);

      // Create rows
      const rowsToCreate = rows.map((row, index) => ({
        rowNumber: index + 1,
        data: row
      }));

      // Store rows
      this.dataRows.set(fileId, rowsToCreate);

      // Save to chrome.storage for persistence
      await chrome.storage.local.set({
        [`ddt_file_${fileId}`]: testDataFile,
        [`ddt_rows_${fileId}`]: rowsToCreate
      });

      return testDataFile;
    } catch (error) {
      console.error('Error uploading JSON:', error);
      throw error;
    }
  }

  /**
   * Get all data files
   */
  async getDataFiles(): Promise<TestDataFile[]> {
    try {
      // Try to load from storage first
      const storageData = await chrome.storage.local.get(null);
      const keys = Object.keys(storageData).filter(key => key.startsWith('ddt_file_'));
      const files: TestDataFile[] = [];

      for (const key of keys) {
        const result = await chrome.storage.local.get([key]);
        if (result[key]) {
          files.push(result[key]);
        }
      }

      return files;
    } catch (error) {
      console.error('Error getting data files:', error);
      // Return in-memory files as fallback
      return Array.from(this.dataFiles.values());
    }
  }

  /**
   * Get a specific data file with its rows
   */
  async getDataFile(fileId: string): Promise<{ file: TestDataFile; rows: TestDataRow[] } | null> {
    try {
      // Try to load from storage
      const fileResult = await chrome.storage.local.get([`ddt_file_${fileId}`]);
      const rowsResult = await chrome.storage.local.get([`ddt_rows_${fileId}`]);

      const file = fileResult[`ddt_file_${fileId}`];
      const rows = rowsResult[`ddt_rows_${fileId}`];

      if (file && rows) {
        return { file, rows };
      }

      // Fallback to in-memory
      const inMemoryFile = this.dataFiles.get(fileId);
      const inMemoryRows = this.dataRows.get(fileId);

      if (inMemoryFile && inMemoryRows) {
        return { file: inMemoryFile, rows: inMemoryRows };
      }

      return null;
    } catch (error) {
      console.error('Error getting data file:', error);
      return null;
    }
  }

  /**
   * Delete a data file
   */
  async deleteDataFile(fileId: string): Promise<boolean> {
    try {
      // Remove from storage
      await chrome.storage.local.remove([`ddt_file_${fileId}`, `ddt_rows_${fileId}`]);

      // Remove from memory
      this.dataFiles.delete(fileId);
      this.dataRows.delete(fileId);

      return true;
    } catch (error) {
      console.error('Error deleting data file:', error);
      return false;
    }
  }

  /**
   * Bind variables to test data
   * Used during test execution to replace ${variable} with actual data
   */
  substituteVariables(template: string, data: Record<string, any>): string {
    let result = template;

    // Replace ${variableName} with actual values
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      result = result.replace(regex, String(data[key] || ''));
    });

    return result;
  }

  /**
   * Execute test with data-driven approach
   * Returns all rows for iteration
   */
  async prepareDataDrivenExecution(fileId: string) {
    try {
      const result = await this.getDataFile(fileId);

      if (!result) {
        throw new Error('Data file not found');
      }

      const { file, rows } = result;

      return {
        fileInfo: file,
        iterations: rows.map(r => ({
          iteration: r.rowNumber,
          variables: r.data
        }))
      };
    } catch (error) {
      console.error('Error preparing DDT execution:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const ddtService = new DDTService();
