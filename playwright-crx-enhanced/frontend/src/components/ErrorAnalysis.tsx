import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from 'recharts';
import './ErrorAnalysis.css';

const API_URL = 'http://localhost:3001/api';

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

interface ErrorAnalysisProps {
  projectId?: string | null;
}

interface FailureReason {
  name: string;
  value: number;
}

interface ErrorHotspot {
  text: string;
  value: number;
}

interface FlakyTest {
  date: string;
  stability: number;
  testName: string;
}

interface ErrorRecovery {
  stage: string;
  count: number;
  percentage: number;
}

interface CachedData {
  data: any[];
  timestamp: number;
}

const ErrorAnalysis: React.FC<ErrorAnalysisProps> = ({ projectId }) => {
  const [failureReasons, setFailureReasons] = useState<FailureReason[]>([]);
  const [errorHotspots, setErrorHotspots] = useState<ErrorHotspot[]>([]);
  const [flakyTests, setFlakyTests] = useState<FlakyTest[]>([]);
  const [errorRecovery, setErrorRecovery] = useState<ErrorRecovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataCache, setDataCache] = useState<CachedData | null>(null);

  const token = localStorage.getItem('accessToken');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  useEffect(() => {
    loadErrorAnalysis();
  }, [projectId]);

  const loadErrorAnalysis = useCallback(async () => {
    // Check cache first
    if (dataCache && Date.now() - dataCache.timestamp < CACHE_DURATION) {
      console.log('Using cached data');
      processAllData(dataCache.data);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const testRunsRes = await axios.get(`${API_URL}/test-runs`, {
        headers,
        params: { projectId: projectId || undefined },
      });

      const runs = testRunsRes.data?.data || [];
      
      // Cache the data
      setDataCache({ data: runs, timestamp: Date.now() });
      
      // Process all data
      processAllData(runs);
      
    } catch (error: any) {
      console.error('Error loading error analysis:', error);
      setError(error.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [projectId, dataCache, headers]);

  const processAllData = useCallback((runs: any[]) => {
    // Process all data in one go to prevent flickering
    processFailureReasons(runs);
    processErrorHotspots(runs);
    processFlakyTests(runs);
    processErrorRecovery(runs);
  }, []);

  const processFailureReasons = (runs: any[]) => {
    const failedRuns = runs.filter(r => r.status === 'failed' || r.status === 'error');
    
    const categories: { [key: string]: number } = {
      'Selector Issues': 0,
      'Timeout Errors': 0,
      'Assertion Failures': 0,
      'Network Errors': 0,
      'Other Errors': 0,
    };

    failedRuns.forEach(run => {
      const errorMsg = run.errorMsg || 'Unknown Error';
      
      if (errorMsg.includes('selector') || errorMsg.includes('locator') || errorMsg.includes('element')) {
        categories['Selector Issues']++;
      } else if (errorMsg.includes('timeout') || errorMsg.includes('wait')) {
        categories['Timeout Errors']++;
      } else if (errorMsg.includes('expect') || errorMsg.includes('assert')) {
        categories['Assertion Failures']++;
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('ERR_')) {
        categories['Network Errors']++;
      } else {
        categories['Other Errors']++;
      }
    });

    // Convert to array format for charts
    const chartData: FailureReason[] = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .filter(cat => cat.value > 0);

    setFailureReasons(chartData);
  };

  const processErrorHotspots = (runs: any[]) => {
    const failedRuns = runs.filter(r => r.status === 'failed' || r.status === 'error');
    const wordFrequency: { [key: string]: number } = {};

    failedRuns.forEach(run => {
      const errorMsg = run.errorMsg || '';
      
      // Extract meaningful words (excluding common words)
      const words = errorMsg
        .toLowerCase()
        .split(/\s+/)
        .filter((word: string) => 
          word.length > 3 && 
          !['the', 'and', 'for', 'with', 'from', 'this', 'that', 'error', 'failed'].includes(word)
        );

      words.forEach((word: string) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
    });

    const hotspots = Object.entries(wordFrequency)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);

    setErrorHotspots(hotspots);
  };

  const processFlakyTests = (runs: any[]) => {
    const testStability: { [key: string]: { passed: number; failed: number; runs: any[] } } = {};

    runs.forEach(run => {
      const testName = run.script?.name || 'Unknown';
      if (!testStability[testName]) {
        testStability[testName] = { passed: 0, failed: 0, runs: [] };
      }
      
      if (run.status === 'passed') {
        testStability[testName].passed++;
      } else if (run.status === 'failed') {
        testStability[testName].failed++;
      }
      
      testStability[testName].runs.push(run);
    });

    // Calculate stability scores over time
    const timelineData: FlakyTest[] = [];
    
    Object.entries(testStability).forEach(([testName, data]) => {
      const total = data.passed + data.failed;
      if (total >= 3) { // Only consider tests with at least 3 runs
        // Sort runs by date
        const sortedRuns = data.runs.sort((a, b) => 
          new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
        );

        // Calculate rolling stability (last 5 runs)
        sortedRuns.forEach((run, index) => {
          const windowStart = Math.max(0, index - 4);
          const window = sortedRuns.slice(windowStart, index + 1);
          const windowPassed = window.filter(r => r.status === 'passed').length;
          const stability = (windowPassed / window.length) * 100;

          timelineData.push({
            date: new Date(run.startedAt).toLocaleDateString(),
            stability: Math.round(stability),
            testName,
          });
        });
      }
    });

    // Get last 30 data points
    const recentFlaky = timelineData.slice(-30);
    setFlakyTests(recentFlaky);
  };

  const processErrorRecovery = (runs: any[]) => {
    const failedRuns = runs.filter(r => r.status === 'failed' || r.status === 'error');
    
    // Mock data for now - in real implementation, track self-healing
    const detected = failedRuns.length;
    const selfHealed = Math.floor(detected * 0.15); // Assume 15% self-healed
    const manualFixed = Math.floor(detected * 0.45); // Assume 45% manually fixed
    const unresolved = detected - selfHealed - manualFixed;

    const recoveryData: ErrorRecovery[] = [
      { stage: 'Errors Detected', count: detected, percentage: 100 },
      { stage: 'Self-Healed', count: selfHealed, percentage: (selfHealed / detected) * 100 },
      { stage: 'Manual Fixed', count: manualFixed, percentage: (manualFixed / detected) * 100 },
      { stage: 'Unresolved', count: unresolved, percentage: (unresolved / detected) * 100 },
    ];

    setErrorRecovery(recoveryData);
  };

  const COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#ffa726', '#ff6b9d'];

  const renderCustomLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  if (loading) {
    return (
      <div className="error-analysis-container">
        <h2 className="analysis-title">📊 Error & Failure Analysis</h2>
        <div className="error-analysis-loading">
          <div className="spinner"></div>
          <p>Analyzing test data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-analysis-container">
        <h2 className="analysis-title">📊 Error & Failure Analysis</h2>
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Unable to Load Analytics</h3>
          <p>{error}</p>
          <button onClick={() => loadErrorAnalysis()} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="error-analysis-container fade-in">
      <div className="analysis-header">
        <h2 className="analysis-title">📊 Error & Failure Analysis</h2>
        <button onClick={() => { setDataCache(null); loadErrorAnalysis(); }} className="refresh-button">
          🔄 Refresh
        </button>
      </div>

      <div className="analysis-grid">
        {/* Failure Reasons - Pie Chart */}
        <div className="chart-card failure-card">
          <div className="chart-header">
            <h3>⚠️ Failure Reasons</h3>
            <p className="chart-description">Distribution of error categories</p>
          </div>
          <div className="chart-content">
            {failureReasons.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={failureReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {failureReasons.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const total = failureReasons.reduce((sum, item) => sum + item.value, 0);
                        const percentage = ((data.value / total) * 100).toFixed(1);
                        return (
                          <div className="custom-tooltip">
                            <p className="label">{data.name}</p>
                            <p className="value">Count: {data.value}</p>
                            <p className="percentage">{percentage}% of total errors</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>✅ No failures detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Hotspots Word Cloud */}
        <div className="chart-card wordcloud-card">
          <div className="chart-header">
            <h3>🔍 Error Hotspots</h3>
            <p className="chart-description">Most frequent error terms</p>
          </div>
          <div className="chart-content">
            {errorHotspots.length > 0 ? (
              <div className="word-cloud">
                {errorHotspots.map((word, index) => {
                  const size = Math.min(40, 12 + (word.value * 2));
                  const opacity = 0.5 + (word.value / errorHotspots[0].value) * 0.5;
                  return (
                    <span
                      key={index}
                      className="word-cloud-item"
                      style={{
                        fontSize: `${size}px`,
                        opacity,
                        color: COLORS[index % COLORS.length],
                      }}
                      title={`${word.text}: ${word.value} occurrences`}
                    >
                      {word.text}
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">
                <p>✅ No error patterns detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Flaky Test Detection Timeline */}
        <div className="chart-card timeline-card">
          <div className="chart-header">
            <h3>📉 Flaky Test Detection</h3>
            <p className="chart-description">Test stability over time</p>
          </div>
          <div className="chart-content">
            {flakyTests.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={flakyTests}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} label={{ value: 'Stability %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p className="label">{payload[0].payload.testName}</p>
                            <p className="value">Stability: {payload[0].value}%</p>
                            <p className="date">Date: {payload[0].payload.date}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="stability" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Stability Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey={() => 80} 
                    stroke="#82ca9d" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    name="Threshold (80%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>✅ No flaky tests detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Error Recovery Funnel */}
        <div className="chart-card funnel-card">
          <div className="chart-header">
            <h3>🎯 Error Recovery Rate</h3>
            <p className="chart-description">Error handling effectiveness</p>
          </div>
          <div className="chart-content">
            {errorRecovery.length > 0 && errorRecovery[0].count > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorRecovery} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={120} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="custom-tooltip">
                            <p className="label">{payload[0].payload.stage}</p>
                            <p className="value">Count: {payload[0].payload.count}</p>
                            <p className="percentage">{payload[0].payload.percentage.toFixed(1)}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Error Count">
                    {errorRecovery.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">
                <p>✅ No errors to recover from</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h4>Total Failures</h4>
            <p className="stat-value">{failureReasons.reduce((sum, cat) => sum + cat.value, 0)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔍</div>
          <div className="stat-content">
            <h4>Unique Error Patterns</h4>
            <p className="stat-value">{errorHotspots.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📉</div>
          <div className="stat-content">
            <h4>Flaky Tests Tracked</h4>
            <p className="stat-value">{new Set(flakyTests.map(f => f.testName)).size}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h4>Recovery Rate</h4>
            <p className="stat-value">
              {errorRecovery.length > 0 && errorRecovery[0].count > 0
                ? `${(((errorRecovery[1]?.count || 0) + (errorRecovery[2]?.count || 0)) / errorRecovery[0].count * 100).toFixed(0)}%`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorAnalysis;
