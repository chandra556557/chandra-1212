import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

const ALLURE_RESULTS_DIR = path.join(process.cwd(), 'allure-results');
const ALLURE_REPORTS_DIR = path.join(process.cwd(), 'allure-reports');

export class AllureService {
  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories() {
    if (!fs.existsSync(ALLURE_RESULTS_DIR)) {
      fs.mkdirSync(ALLURE_RESULTS_DIR, { recursive: true });
    }
    if (!fs.existsSync(ALLURE_REPORTS_DIR)) {
      fs.mkdirSync(ALLURE_REPORTS_DIR, { recursive: true });
    }
  }

  async startTest(testRunId: string, scriptName: string) {
    try {
      const testData = {
        uuid: testRunId,
        testCaseId: testRunId,
        fullName: scriptName,
        name: scriptName,
        historyId: testRunId,
        start: Date.now(),
        steps: [],
      };

      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testRunId}-result.json`);
      fs.writeFileSync(resultsPath, JSON.stringify(testData, null, 2));

      return testData;
    } catch (error) {
      logger.error('Error starting Allure test:', error);
      throw error;
    }
  }

  async recordStep(testId: string, stepName: string, status: 'passed' | 'failed' | 'broken', duration?: number) {
    try {
      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testId}-result.json`);

      const stepData = {
        name: stepName,
        status,
        statusDetails: {},
        stage: 'finished',
        start: Date.now() - (duration || 0),
        stop: Date.now(),
      };

      let results: any = { steps: [] };
      if (fs.existsSync(resultsPath)) {
        results = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
      }

      results.steps = results.steps || [];
      results.steps.push(stepData);

      fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    } catch (error) {
      logger.error('Error recording Allure step:', error);
    }
  }

  async endTest(testId: string, status: 'passed' | 'failed' | 'broken', errorMessage?: string) {
    try {
      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testId}-result.json`);

      const result = {
        uuid: testId,
        historyId: testId,
        testCaseId: testId,
        fullName: testId,
        name: testId,
        status,
        statusDetails: errorMessage ? { message: errorMessage } : {},
        stage: 'finished',
        start: Date.now(),
        stop: Date.now(),
        steps: [],
      };

      if (fs.existsSync(resultsPath)) {
        const existing = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
        result.steps = existing.steps || [];
      }

      fs.writeFileSync(resultsPath, JSON.stringify(result, null, 2));

      logger.info(`Allure test ended: ${testId} with status: ${status}`);
    } catch (error) {
      logger.error('Error ending Allure test:', error);
    }
  }

  async generateReport(testRunId: string): Promise<string> {
    try {
      const reportPath = path.join(ALLURE_REPORTS_DIR, testRunId);

      if (!fs.existsSync(reportPath)) {
        fs.mkdirSync(reportPath, { recursive: true });
      }

      // Check if allure results exist for this test run
      const resultsPath = path.join(ALLURE_RESULTS_DIR, `${testRunId}-result.json`);
      
      // Always try to generate with Allure CLI first for the official report
      try {
        logger.info(`Generating Allure report with CLI for: ${testRunId}`);
        
        // Fix JAVA_HOME if it ends with \bin
        let javaHome = process.env.JAVA_HOME || '';
        if (javaHome.endsWith('\\bin') || javaHome.endsWith('/bin')) {
          javaHome = path.dirname(javaHome);
          logger.info(`Fixed JAVA_HOME from ${process.env.JAVA_HOME} to ${javaHome}`);
        }
        
        // Use the installed allure-commandline package
        const allureBin = path.join(process.cwd(), 'node_modules', '.bin', 'allure');
        const isWindows = process.platform === 'win32';
        const allureCmd = isWindows ? `"${allureBin}.cmd"` : allureBin;
        
        // Clean old report first
        if (fs.existsSync(reportPath)) {
          fs.rmSync(reportPath, { recursive: true, force: true });
          fs.mkdirSync(reportPath, { recursive: true });
        }
        
        const command = `${allureCmd} generate "${ALLURE_RESULTS_DIR}" -o "${reportPath}" --clean`;
        
        logger.info(`Executing: ${command}`);
        
        const result = execSync(command, {
          cwd: process.cwd(),
          stdio: 'pipe',
          encoding: 'utf-8',
          windowsHide: true,
          env: {
            ...process.env,
            JAVA_HOME: javaHome
          }
        });
        
        logger.info(`Allure CLI output: ${result}`);
        
        // Verify index.html was created
        const indexPath = path.join(reportPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          logger.info(`✅ Official Allure report generated successfully at: ${reportPath}`);
          return reportPath;
        } else {
          throw new Error('index.html not generated by Allure CLI');
        }
        
      } catch (execError: any) {
        logger.warn('⚠️ Allure CLI generation failed, trying fallback...', execError.message);
        logger.warn('Error details:', execError.toString());
        
        // Fallback: Create a basic HTML report
        if (!fs.existsSync(resultsPath)) {
          logger.warn(`No Allure results found for test run: ${testRunId}, creating empty report`);
          const emptyReportHtml = `<!DOCTYPE html>
<html>
<head><title>Test Report - ${testRunId}</title></head>
<body style="font-family: Arial, sans-serif; margin: 20px;">
<h1>Test Report</h1>
<p>Report for test run: ${testRunId}</p>
<p>Status: No test results available</p>
</body>
</html>`;
          fs.writeFileSync(path.join(reportPath, 'index.html'), emptyReportHtml);
          logger.info(`Empty report created at: ${reportPath}`);
          return reportPath;
        }
        
        const resultsData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
        
        const basicReportHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Test Report - ${resultsData.name || testRunId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .status { padding: 15px; margin: 20px 0; border-radius: 8px; font-weight: bold; }
    .passed { background: #10b981; color: white; }
    .failed { background: #ef4444; color: white; }
    .running { background: #f59e0b; color: white; }
    .step { border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; background: white; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .step-status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .step-passed { background: #d1fae5; color: #065f46; }
    .step-failed { background: #fee2e2; color: #991b1b; }
    h1, h2, h3 { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="container">
      <h1>🎭 Test Execution Report</h1>
      <p style="opacity: 0.9;">Test Run ID: ${testRunId}</p>
    </div>
  </div>
  <div class="container">
    <div class="status ${resultsData.status || 'running'}">
      <h2>Status: ${(resultsData.status || 'RUNNING').toUpperCase()}</h2>
    </div>
    <h3>📋 Test Steps (${(resultsData.steps || []).length}):</h3>
    ${(resultsData.steps || []).map((step: any, idx: number) => `
      <div class="step">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>Step ${idx + 1}: ${step.name || 'Unknown step'}</strong>
          <span class="step-status step-${step.status || 'unknown'}">${(step.status || 'N/A').toUpperCase()}</span>
        </div>
        ${step.statusDetails?.message ? `<p style="margin-top: 10px; color: #666;">${step.statusDetails.message}</p>` : ''}
      </div>
    `).join('')}
    ${(resultsData.steps || []).length === 0 ? '<p style="color: #666;">No test steps recorded</p>' : ''}
  </div>
</body>
</html>`;
        
        fs.writeFileSync(path.join(reportPath, 'index.html'), basicReportHtml);
        logger.info(`📄 Fallback HTML report created at: ${reportPath}`);
        return reportPath;
      }
    } catch (error) {
      logger.error('❌ Error generating report:', error);
      throw new Error('Failed to generate report');
    }
  }

  async getReportUrl(testRunId: string): Promise<string> {
    const reportPath = path.join(ALLURE_REPORTS_DIR, testRunId);
    if (fs.existsSync(reportPath)) {
      return `/allure-reports/${testRunId}/index.html`;
    }
    return '';
  }

  async cleanupOldReports(daysToKeep = 7) {
    try {
      const now = Date.now();
      const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

      const reports = fs.readdirSync(ALLURE_REPORTS_DIR);
      for (const report of reports) {
        const reportPath = path.join(ALLURE_REPORTS_DIR, report);
        const stats = fs.statSync(reportPath);

        if (now - stats.mtimeMs > maxAge) {
          fs.rmSync(reportPath, { recursive: true, force: true });
          logger.info(`Cleaned up old Allure report: ${report}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up Allure reports:', error);
    }
  }

  getAllReports(): Array<{ id: string; path: string; createdAt: Date }> {
    try {
      const reports = fs.readdirSync(ALLURE_REPORTS_DIR);
      return reports.map(report => {
        const reportPath = path.join(ALLURE_REPORTS_DIR, report);
        const stats = fs.statSync(reportPath);
        return {
          id: report,
          path: `/allure-reports/${report}/index.html`,
          createdAt: stats.birthtime,
        };
      });
    } catch (error) {
      logger.error('Error getting Allure reports:', error);
      return [];
    }
  }
}

export const allureService = new AllureService();
