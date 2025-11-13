import { Request, Response } from 'express';
import { allureService } from '../services/allure.service';
import { logger } from '../utils/logger';
import pool from '../db';


export const generateReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testRunId } = req.params;

    if (!testRunId) {
      res.status(400).json({ success: false, error: 'Test run ID is required' });
      return;
    }

    logger.info(`Generating report for test run: ${testRunId}`);

    const reportPath = await allureService.generateReport(testRunId);
    const reportUrl = await allureService.getReportUrl(testRunId);

    logger.info(`Report generated at: ${reportPath}, URL: ${reportUrl}`);

    // Update the TestRun with the report URL
    await pool.query(
      'UPDATE "TestRun" SET "executionReportUrl" = $1 WHERE id = $2',
      [reportUrl, testRunId]
    );

    logger.info(`Execution report URL saved for test run: ${testRunId}`);

    res.json({
      success: true,
      reportPath,
      reportUrl,
      message: 'Execution report generated successfully',
    });
  } catch (error: any) {
    logger.error('Error generating Execution report:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate Execution report',
    });
  }
};

export const getReportUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testRunId } = req.params;

    const reportUrl = await allureService.getReportUrl(testRunId);

    if (!reportUrl) {
      res.status(404).json({ success: false, error: 'Report not found' });
      return;
    }

    res.json({ success: true, reportUrl });
  } catch (error: any) {
    logger.error('Error getting Execution report URL:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to get report URL' });
  }
};

export const getAllReports = async (_req: Request, res: Response) => {
  try {
    const reports = allureService.getAllReports();
    res.json({ success: true, reports });
  } catch (error: any) {
    logger.error('Error getting all Execution reports:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to get reports' });
  }
};

export const cleanupOldReports = async (req: Request, res: Response) => {
  try {
    const { days } = req.body;
    const daysToKeep = days || 7;

    await allureService.cleanupOldReports(daysToKeep);

    res.json({ success: true, message: `Cleaned up reports older than ${daysToKeep} days` });
  } catch (error: any) {
    logger.error('Error cleaning up Execution reports:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to cleanup reports' });
  }
};

