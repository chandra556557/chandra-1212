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

import * as React from 'react';

// Type definitions for React JSX
interface ReactElement<P = any> {}
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
import { ddtService, TestDataFile } from './ddtService';

interface DDTManagerProps {
  onFileSelected?: (fileId: string) => void;
}

export const DDTManager: React.FC<DDTManagerProps> = ({ onFileSelected }) => {
  const [files, setFiles] = React.useState<TestDataFile[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedFile, setSelectedFile] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load files on component mount
  React.useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const dataFiles = await ddtService.getDataFiles();
      setFiles(dataFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const content = await file.text();

      let testDataFile: TestDataFile;
      if (file.name.endsWith('.csv')) {
        testDataFile = await ddtService.uploadCSV(file.name, content);
      } else if (file.name.endsWith('.json')) {
        testDataFile = await ddtService.uploadJSON(file.name, content);
      } else {
        throw new Error('Unsupported file type. Please upload CSV or JSON files.');
      }

      // Add to files list
      setFiles(prev => [...prev, testDataFile]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setLoading(true);
      const success = await ddtService.deleteDataFile(fileId);
      if (success) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        if (selectedFile === fileId) {
          setSelectedFile('');
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Error deleting file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
    if (onFileSelected) {
      onFileSelected(fileId);
    }
  };

  return (
    <div className="ddt-manager">
      <div className="ddt-header">
        <h3>Data Files</h3>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv,.json"
          onChange={handleFileUpload}
          disabled={loading}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {files.length === 0 ? (
        <p>No data files uploaded yet.</p>
      ) : (
        <div className="ddt-files">
          {files.map(file => (
            <div
              key={file.id}
              className={`ddt-file ${selectedFile === file.id ? 'selected' : ''}`}
              onClick={() => handleFileSelect(file.id)}
            >
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  <span className="file-type">{file.fileType.toUpperCase()}</span>
                  <span className="row-count">{file.rowCount} rows</span>
                  <span className="column-count">{file.columnNames.length} columns</span>
                </div>
              </div>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFileDelete(file.id);
                }}
                disabled={loading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
