import React, { useEffect, useState } from 'react';

interface ApiTestingProps {}

const ApiTesting: React.FC<ApiTestingProps> = () => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [genPrompt, setGenPrompt] = useState('');
  const [genCount, setGenCount] = useState<number>(1);
  const [genSchema, setGenSchema] = useState('');
  const [genStrategy, setGenStrategy] = useState<'boundary' | 'performance' | 'security' | 'equivalence' | 'idempotency' | ''>('');
  const [suggestPrompt, setSuggestPrompt] = useState('');
  const [suggestResult, setSuggestResult] = useState<any>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [contractSchema, setContractSchema] = useState('');
  const [contractResult, setContractResult] = useState<any>(null);
  const [contractLoading, setContractLoading] = useState(false);
  const [mockPrompt, setMockPrompt] = useState('');
  const [mockSchema, setMockSchema] = useState('');
  const [mockCount, setMockCount] = useState<number>(1);
  const [mockResult, setMockResult] = useState<any>(null);
  const [mockLoading, setMockLoading] = useState(false);
  const [ctSuiteId, setCtSuiteId] = useState<string>('');
  const [ctName, setCtName] = useState<string>('');
  const [ctMethod, setCtMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('POST');
  const [ctEndpoint, setCtEndpoint] = useState<string>('');
  const [ctDescription, setCtDescription] = useState<string>('');
  const [ctHeaders, setCtHeaders] = useState<string>('');
  const [ctBody, setCtBody] = useState<string>('');
  const [ctExpectedStatus, setCtExpectedStatus] = useState<string>('');
  const [ctAssertions, setCtAssertions] = useState<string>('');
  const [ctLoading, setCtLoading] = useState(false);
  const [ctResult, setCtResult] = useState<any>(null);
  const [genResult, setGenResult] = useState<any>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [execTestCaseId, setExecTestCaseId] = useState<string>('');
  const [execHeaders, setExecHeaders] = useState('');
  const [execBodyWrapper, setExecBodyWrapper] = useState('');
  const [execResult, setExecResult] = useState<any>(null);
  const [execLoading, setExecLoading] = useState(false);
  const [suites, setSuites] = useState<Array<{ id: number; name: string }>>([]);
  const [suiteLoading, setSuiteLoading] = useState(false);
  const [showCreateSuite, setShowCreateSuite] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState('');
  const [newSuiteBaseUrl, setNewSuiteBaseUrl] = useState('');
  const [newSuiteHeaders, setNewSuiteHeaders] = useState('');
  const [newSuiteDescription, setNewSuiteDescription] = useState('');
  const [saveBanner, setSaveBanner] = useState<{ visible: boolean; suiteName?: string; testCaseId?: number }>({ visible: false });
  const [authVisible, setAuthVisible] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [pendingAction, setPendingAction] = useState<null | (() => void)>(null);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      let parsedHeaders = {};
      if (headers.trim()) {
        parsedHeaders = JSON.parse(headers);
      }

      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders
        }
      };

      if (method !== 'GET' && body.trim()) {
        options.body = body;
      }

      const res = await fetch(url, options);
      const data = await res.json().catch(() => res.text());

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        data
      });
    } catch (error: any) {
      setResponse({
        error: true,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const apiFetch = async (url: string, options: RequestInit = {}, on401?: () => void) => {
    const token = localStorage.getItem('accessToken');
    console.log('API Fetch - Token:', token ? 'Present' : 'Missing', 'URL:', url);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as any || {})
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    console.log('API Fetch - Response Status:', res.status, 'URL:', url);
    if (res.status === 401) {
      console.log('API Fetch - 401 detected, showing auth modal');
      if (on401) setPendingAction(() => on401);
      setAuthVisible(true);
    }
    return res;
  };

  const loadSuites = async () => {
    setSuiteLoading(true);
    try {
      const res = await apiFetch('/api/api-testing/suites', { method: 'GET' }, loadSuites);
      const data = await res.json().catch(() => ({ data: [] }));
      const list = (data?.data || []).map((s: any) => ({ id: s.id, name: s.name }));
      setSuites(Array.isArray(list) ? list : []);
      if (!ctSuiteId && list.length > 0) setCtSuiteId(String(list[0].id));
      setShowCreateSuite(list.length === 0);
    } catch {}
    finally { setSuiteLoading(false); }
  };

  useEffect(() => { loadSuites(); }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (res.status >= 200 && res.status < 300) {
        if (data?.accessToken) localStorage.setItem('accessToken', data.accessToken);
        if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
        setAuthVisible(false);
        if (pendingAction) {
          const retry = pendingAction;
          setPendingAction(null);
          retry();
        }
      } else {
        setLoginError(data?.error || 'Login failed');
      }
    } catch (e: any) {
      setLoginError(e.message || 'Login error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGenerateTestData = async () => {
    setGenLoading(true);
    setGenResult(null);
    try {
      const payload: any = { prompt: genPrompt, count: genCount };
      if (genSchema.trim()) {
        try {
          payload.schema = JSON.parse(genSchema);
        } catch {
          payload.schema = genSchema;
        }
      }
      if (genStrategy) payload.strategy = genStrategy;
      const res = await apiFetch('/api/testdata/generate', { method: 'POST', body: JSON.stringify(payload) }, handleGenerateTestData);
      const data = await res.json().catch(() => res.text());
      setGenResult({ status: res.status, statusText: res.statusText, data });
    } catch (error: any) {
      setGenResult({ error: true, message: error.message });
    } finally {
      setGenLoading(false);
    }
  };

  const handleExecuteWithTestData = async () => {
    setExecLoading(true);
    setExecResult(null);
    try {
      const payload: any = { prompt: genPrompt, count: genCount };
      if (genSchema.trim()) {
        try { payload.schema = JSON.parse(genSchema); } catch { payload.schema = genSchema; }
      }
      if (genStrategy) payload.strategy = genStrategy;
      if (execBodyWrapper.trim()) {
        try { payload.bodyWrapper = JSON.parse(execBodyWrapper); } catch { payload.bodyWrapper = {}; }
      }
      if (execHeaders.trim()) {
        try { payload.headers = JSON.parse(execHeaders); } catch { payload.headers = {}; }
      }
      const res = await apiFetch(`/api/api-testing/test-cases/${execTestCaseId}/execute-with-testdata`, { method: 'POST', body: JSON.stringify(payload) }, handleExecuteWithTestData);
      const data = await res.json().catch(() => res.text());
      setExecResult({ status: res.status, statusText: res.statusText, data });
    } catch (error: any) {
      setExecResult({ error: true, message: error.message });
    } finally {
      setExecLoading(false);
    }
  };

  const handleCreateTestCase = async () => {
    setCtLoading(true);
    setCtResult(null);
    try {
      const payload: any = {
        suiteId: Number(ctSuiteId),
        name: ctName,
        method: ctMethod,
        endpoint: ctEndpoint,
        description: ctDescription || undefined,
      };
      if (ctHeaders.trim()) {
        try { payload.headers = JSON.parse(ctHeaders); } catch { payload.headers = ctHeaders; }
      }
      if (ctBody.trim()) {
        payload.body = ctBody;
      }
      if (ctExpectedStatus.trim()) {
        payload.expectedStatus = Number(ctExpectedStatus);
      }
      if (ctAssertions.trim()) {
        try { payload.assertions = JSON.parse(ctAssertions); } catch { payload.assertions = []; }
      }
      const res = await apiFetch('/api/api-testing/test-cases', { method: 'POST', body: JSON.stringify(payload) }, handleCreateTestCase);
      const data = await res.json().catch(() => res.text());
      setCtResult({ status: res.status, statusText: res.statusText, data });
      try {
        const created = (data && data.data) ? data.data : data;
        const sid = Number(created?.suite_id || ctSuiteId);
        const sname = suites.find(s => s.id === sid)?.name;
        if (res.status >= 200 && res.status < 300 && created?.id) {
          setSaveBanner({ visible: true, suiteName: sname || String(sid), testCaseId: created.id });
        }
      } catch {}
    } catch (error: any) {
      setCtResult({ error: true, message: error.message });
    } finally {
      setCtLoading(false);
    }
  };

  const handleCreateSuite = async () => {
    if (!newSuiteName.trim()) return;
    setSuiteLoading(true);
    try {
      let headersObj: any = undefined;
      if (newSuiteHeaders.trim()) {
        try { headersObj = JSON.parse(newSuiteHeaders); } catch { headersObj = undefined; }
      }
      const body = JSON.stringify({ name: newSuiteName.trim(), description: newSuiteDescription.trim() || undefined, baseUrl: newSuiteBaseUrl.trim() || undefined, headers: headersObj });
      const res = await apiFetch('/api/api-testing/suites', { method: 'POST', body }, handleCreateSuite);
      const data = await res.json().catch(() => ({}));
      const suite = data?.data || data;
      if (res.status >= 200 && res.status < 300 && suite?.id) {
        const next = [...suites, { id: suite.id, name: suite.name }];
        setSuites(next);
        setCtSuiteId(String(suite.id));
        setShowCreateSuite(false);
        setNewSuiteName('');
        setNewSuiteBaseUrl('');
        setNewSuiteHeaders('');
        setNewSuiteDescription('');
      }
    } catch {}
    finally { setSuiteLoading(false); }
  };

  const handleRunCreatedTestCase = async () => {
    const id = saveBanner.testCaseId;
    if (!id) return;
    try {
      const res = await apiFetch(`/api/api-testing/test-cases/${id}/execute`, { method: 'POST' }, handleRunCreatedTestCase);
      const data = await res.json().catch(() => res.text());
      setExecResult({ status: res.status, statusText: res.statusText, data });
      setSaveBanner({ visible: false });
    } catch {}
  };

  const handleSuggestAssertions = async () => {
    setSuggestLoading(true);
    setSuggestResult(null);
    try {
      const payload = { prompt: suggestPrompt };
      const res = await apiFetch('/api/api-testing/python/assertions/suggest', { method: 'POST', body: JSON.stringify(payload) }, handleSuggestAssertions);
      const data = await res.json().catch(() => res.text());
      setSuggestResult({ status: res.status, statusText: res.statusText, data });
      
      // Auto-fill assertions if suggestions are returned
      if (res.status >= 200 && res.status < 300 && data?.data?.suggestions) {
        const suggestions = data.data.suggestions;
        if (Array.isArray(suggestions) && suggestions.length > 0) {
          setCtAssertions(JSON.stringify(suggestions, null, 2));
        }
      }
    } catch (error: any) {
      setSuggestResult({ error: true, message: error.message });
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleValidateContract = async () => {
    setContractLoading(true);
    setContractResult(null);
    try {
      let schemaObj: any = {};
      if (contractSchema.trim()) {
        try {
          schemaObj = JSON.parse(contractSchema);
        } catch {
          schemaObj = { schema: contractSchema };
        }
      }
      const payload = { schema: schemaObj };
      const res = await apiFetch('/api/api-testing/python/contracts/validate', { method: 'POST', body: JSON.stringify(payload) }, handleValidateContract);
      const data = await res.json().catch(() => res.text());
      setContractResult({ status: res.status, statusText: res.statusText, data });
    } catch (error: any) {
      setContractResult({ error: true, message: error.message });
    } finally {
      setContractLoading(false);
    }
  };

  const handleGenerateMocks = async () => {
    setMockLoading(true);
    setMockResult(null);
    try {
      const payload: any = { prompt: mockPrompt, count: mockCount };
      if (mockSchema.trim()) {
        try {
          payload.schema = JSON.parse(mockSchema);
        } catch {
          payload.schema = mockSchema;
        }
      }
      const res = await apiFetch('/api/api-testing/python/mocks/generate', { method: 'POST', body: JSON.stringify(payload) }, handleGenerateMocks);
      const data = await res.json().catch(() => res.text());
      setMockResult({ status: res.status, statusText: res.statusText, data });
    } catch (error: any) {
      setMockResult({ error: true, message: error.message });
    } finally {
      setMockLoading(false);
    }
  };

  const onStrategyChange = (val: string) => {
    setGenStrategy(val as any);
    try {
      switch (val) {
        case 'boundary':
          setGenSchema(JSON.stringify({ username: { type: 'string', minLength: 0, maxLength: 255 }, age: { type: 'number', min: 0, max: 120 }, email: { type: 'string', pattern: 'email' } }, null, 2));
          break;
        case 'performance':
          setGenSchema(JSON.stringify({ limit: { type: 'number', values: [10, 50, 100, 500, 1000] }, cursor: { type: 'string' } }, null, 2));
          break;
        case 'security':
          setGenSchema(JSON.stringify({ payload: { type: 'string', samples: ["' OR '1'='1", '<script>alert(1)</script>', '../../etc/passwd', '${7*7}', '; rm -rf /', '%00', '"; DROP TABLE users; --', '{ "$gt": "" }'] }, auth: { type: 'string', values: ['invalidToken', 'empty', 'expired'] } }, null, 2));
          break;
        case 'equivalence':
          setGenSchema(JSON.stringify({ code: { type: 'string', partitions: ['valid', 'invalid', 'expired', 'used', 'format_error', 'not_found'] } }, null, 2));
          break;
        case 'idempotency':
          setGenSchema(JSON.stringify({ page: { type: 'number', values: [1, 2] }, idempotencyKey: { type: 'string', values: ['k1', 'k2'] } }, null, 2));
          break;
        default:
          break;
      }
    } catch {}
  };

  return (
    <div className="view-container">
      <h1 className="view-title">API Testing</h1>
      
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>API Request</h3>
        
        <div className="form-group">
          <label>Method</label>
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value as any)}
            className="form-select"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="form-group">
          <label>URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Headers (JSON)</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{"Authorization": "Bearer token", "X-Custom-Header": "value"}'
            className="form-textarea"
            rows={4}
          />
        </div>

        {method !== 'GET' && (
          <div className="form-group">
            <label>Body (JSON or text)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="form-textarea"
              rows={6}
            />
          </div>
        )}

        <button 
          onClick={handleSendRequest} 
          disabled={loading || !url}
          className="btn-primary"
        >
          {loading ? '⏳ Sending...' : '🚀 Send Request'}
        </button>
      </div>

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>Suggest Assertions</h3>
        <div className="form-group">
          <label>API Description</label>
          <textarea
            value={suggestPrompt}
            onChange={(e) => setSuggestPrompt(e.target.value)}
            placeholder="Describe your API endpoint, expected behavior, and what you want to test"
            className="form-textarea"
            rows={4}
          />
        </div>
        <button 
          onClick={handleSuggestAssertions} 
          disabled={suggestLoading || !suggestPrompt}
          className="btn-primary"
        >
          {suggestLoading ? '⏳ Suggesting...' : '💡 Suggest Assertions'}
        </button>
      </div>

      {suggestResult && (
        <div className="content-card">
          <h3>Assertion Suggestions</h3>
          {suggestResult.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {suggestResult.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  style={{ 
                    color: suggestResult.status >= 200 && suggestResult.status < 300 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {suggestResult.status} {suggestResult.statusText}
                </span>
              </div>
              <div>
                <strong>Suggestions:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  maxHeight: '400px'
                }}>
                  {typeof suggestResult.data === 'string' 
                    ? suggestResult.data 
                    : JSON.stringify(suggestResult.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>Validate Contract</h3>
        <div className="form-group">
          <label>OpenAPI/GraphQL Schema (JSON)</label>
          <textarea
            value={contractSchema}
            onChange={(e) => setContractSchema(e.target.value)}
            placeholder='{"openapi":"3.0.0","info":{"title":"API","version":"1.0.0"}}'
            className="form-textarea"
            rows={6}
          />
        </div>
        <button 
          onClick={handleValidateContract} 
          disabled={contractLoading || !contractSchema}
          className="btn-primary"
        >
          {contractLoading ? '⏳ Validating...' : '🔍 Validate Contract'}
        </button>
      </div>

      {contractResult && (
        <div className="content-card">
          <h3>Contract Validation Result</h3>
          {contractResult.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {contractResult.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  style={{ 
                    color: contractResult.status >= 200 && contractResult.status < 300 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {contractResult.status} {contractResult.statusText}
                </span>
              </div>
              <div>
                <strong>Validation Result:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  maxHeight: '400px'
                }}>
                  {typeof contractResult.data === 'string' 
                    ? contractResult.data 
                    : JSON.stringify(contractResult.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>Generate Mocks</h3>
        <div className="form-group">
          <label>Mock Description</label>
          <input
            type="text"
            value={mockPrompt}
            onChange={(e) => setMockPrompt(e.target.value)}
            placeholder="Describe the mock data you need"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Count</label>
          <input
            type="number"
            value={mockCount}
            min={1}
            onChange={(e) => setMockCount(Number(e.target.value))}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Schema (optional JSON)</label>
          <textarea
            value={mockSchema}
            onChange={(e) => setMockSchema(e.target.value)}
            placeholder='{"id":"number","name":"string"}'
            className="form-textarea"
            rows={4}
          />
        </div>
        <button 
          onClick={handleGenerateMocks} 
          disabled={mockLoading || !mockPrompt}
          className="btn-primary"
        >
          {mockLoading ? '⏳ Generating...' : '🎭 Generate Mocks'}
        </button>
      </div>

      {mockResult && (
        <div className="content-card">
          <h3>Generated Mocks</h3>
          {mockResult.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {mockResult.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  style={{ 
                    color: mockResult.status >= 200 && mockResult.status < 300 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {mockResult.status} {mockResult.statusText}
                </span>
              </div>
              <div>
                <strong>Mock Data:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  maxHeight: '400px'
                }}>
                  {typeof mockResult.data === 'string' 
                    ? mockResult.data 
                    : JSON.stringify(mockResult.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>Generate Test Data</h3>
        <div className="form-group">
          <label>Prompt</label>
          <input
            type="text"
            value={genPrompt}
            onChange={(e) => setGenPrompt(e.target.value)}
            placeholder="Describe the data to generate"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Count</label>
          <input
            type="number"
            value={genCount}
            min={1}
            onChange={(e) => setGenCount(Number(e.target.value))}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Strategy</label>
          <select
            value={genStrategy}
            onChange={(e) => onStrategyChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select</option>
            <option value="boundary">Boundary</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="equivalence">Equivalence</option>
            <option value="idempotency">Idempotency</option>
          </select>
        </div>
        <div className="form-group">
          <label>Schema (optional JSON)</label>
          <textarea
            value={genSchema}
            onChange={(e) => setGenSchema(e.target.value)}
            placeholder='{"name":"string","age":"number"}'
            className="form-textarea"
            rows={4}
          />
        </div>
        <button 
          onClick={handleGenerateTestData}
          disabled={genLoading || !genPrompt}
          className="btn-primary"
        >
          {genLoading ? '⏳ Generating...' : '🧪 Generate'}
        </button>
      </div>

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>Create Test Case</h3>
        <div className="form-group">
          <label>Suite</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={ctSuiteId} onChange={(e) => setCtSuiteId(e.target.value)} className="form-select" disabled={suiteLoading}>
              {suites.length === 0 ? <option value="">No suites</option> : null}
              {suites.map(s => (
                <option key={s.id} value={String(s.id)}>{s.name}</option>
              ))}
            </select>
            <button className="btn-secondary" onClick={() => setShowCreateSuite(v => !v)}>
              ➕ Create Suite
            </button>
          </div>
        </div>
        {showCreateSuite && (
          <div className="content-card" style={{ marginBottom: '12px' }}>
            <h4>Create Suite</h4>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={newSuiteName} onChange={(e) => setNewSuiteName(e.target.value)} className="form-input" />
            </div>
            <div className="form-group">
              <label>Base URL</label>
              <input type="text" value={newSuiteBaseUrl} onChange={(e) => setNewSuiteBaseUrl(e.target.value)} className="form-input" placeholder="https://api.example.com" />
            </div>
            <div className="form-group">
              <label>Headers (JSON)</label>
              <textarea value={newSuiteHeaders} onChange={(e) => setNewSuiteHeaders(e.target.value)} className="form-textarea" rows={3} placeholder='{"Authorization":"Bearer token"}' />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input type="text" value={newSuiteDescription} onChange={(e) => setNewSuiteDescription(e.target.value)} className="form-input" />
            </div>
            <button className="btn-primary" onClick={handleCreateSuite} disabled={suiteLoading || !newSuiteName.trim()}>
              {suiteLoading ? '⏳ Creating...' : '➕ Create Suite'}
            </button>
          </div>
        )}
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={ctName} onChange={(e) => setCtName(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label>Method</label>
          <select value={ctMethod} onChange={(e) => setCtMethod(e.target.value as any)} className="form-select">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
        <div className="form-group">
          <label>Endpoint</label>
          <input type="text" value={ctEndpoint} onChange={(e) => setCtEndpoint(e.target.value)} className="form-input" placeholder="/api/endpoint" />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input type="text" value={ctDescription} onChange={(e) => setCtDescription(e.target.value)} className="form-input" />
        </div>
        <div className="form-group">
          <label>Headers (JSON)</label>
          <textarea value={ctHeaders} onChange={(e) => setCtHeaders(e.target.value)} className="form-textarea" rows={4} placeholder='{"Content-Type":"application/json"}' />
        </div>
        <div className="form-group">
          <label>Body (text or JSON string)</label>
          <textarea value={ctBody} onChange={(e) => setCtBody(e.target.value)} className="form-textarea" rows={6} placeholder='{"key":"value"}' />
        </div>
        <div className="form-group">
          <label>Expected Status</label>
          <input type="number" value={ctExpectedStatus} onChange={(e) => setCtExpectedStatus(e.target.value)} className="form-input" placeholder="200" />
        </div>
        <div className="form-group">
          <label>Assertions (JSON Array)</label>
          <textarea value={ctAssertions} onChange={(e) => setCtAssertions(e.target.value)} className="form-textarea" rows={6} placeholder='[{"type":"status","expected":200}]' />
        </div>
        <button onClick={handleCreateTestCase} disabled={ctLoading || !ctSuiteId || !ctName || !ctMethod || !ctEndpoint} className="btn-primary">
          {ctLoading ? '⏳ Creating...' : '➕ Create Test Case'}
        </button>
      </div>

      {saveBanner.visible && (
        <div className="content-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Saved test case</strong> to suite {saveBanner.suiteName}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleRunCreatedTestCase}>▶️ Run Now</button>
              <button className="btn-secondary" onClick={() => setSaveBanner({ visible: false })}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {ctResult && (
        <div className="content-card">
          <h3>Create Test Case Result</h3>
          {ctResult.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {ctResult.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span style={{ color: ctResult.status >= 200 && ctResult.status < 300 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                  {ctResult.status} {ctResult.statusText}
                </span>
              </div>
              <div>
                <strong>Body:</strong>
                <pre style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px', overflow: 'auto', fontSize: '13px', maxHeight: '400px' }}>
                  {typeof ctResult.data === 'string' ? ctResult.data : JSON.stringify(ctResult.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <h3>Execute Test Case With Generated Data</h3>
        <div className="form-group">
          <label>Test Case ID</label>
          <input
            type="text"
            value={execTestCaseId}
            onChange={(e) => setExecTestCaseId(e.target.value)}
            placeholder="Enter saved test case ID"
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Header Overrides (JSON)</label>
          <textarea
            value={execHeaders}
            onChange={(e) => setExecHeaders(e.target.value)}
            placeholder='{"X-Test-Type":"boundary"}'
            className="form-textarea"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Body Wrapper (JSON)</label>
          <textarea
            value={execBodyWrapper}
            onChange={(e) => setExecBodyWrapper(e.target.value)}
            placeholder='{"action":"bulkCreate"}'
            className="form-textarea"
            rows={4}
          />
        </div>
        <button
          onClick={handleExecuteWithTestData}
          disabled={execLoading || !genPrompt || !execTestCaseId}
          className="btn-primary"
        >
          {execLoading ? '⏳ Executing...' : '▶️ Execute With Data'}
        </button>
      </div>

      {genResult && (
        <div className="content-card">
          <h3>Generated Data</h3>
          {genResult.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {genResult.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  style={{ 
                    color: genResult.status >= 200 && genResult.status < 300 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {genResult.status} {genResult.statusText}
                </span>
              </div>
              <div>
                <strong>Body:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  maxHeight: '400px'
                }}>
                  {typeof genResult.data === 'string' 
                    ? genResult.data 
                    : JSON.stringify(genResult.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      {execResult && (
        <div className="content-card">
          <h3>Execution Result</h3>
          {execResult.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {execResult.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  style={{ 
                    color: execResult.status >= 200 && execResult.status < 300 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {execResult.status} {execResult.statusText}
                </span>
              </div>
              <div>
                <strong>Body:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  maxHeight: '400px'
                }}>
                  {typeof execResult.data === 'string' 
                    ? execResult.data 
                    : JSON.stringify(execResult.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      {authVisible && (
        <div className="content-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3>Re‑Login Required</h3>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="form-input" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="form-input" />
          </div>
          {loginError && <div style={{ color: '#ef4444', marginBottom: 8 }}>{loginError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleLogin} disabled={loginLoading || !loginEmail || !loginPassword}>{loginLoading ? '⏳ Logging in...' : '🔐 Login'}</button>
            <button className="btn-secondary" onClick={() => { setAuthVisible(false); setPendingAction(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {response && (
        <div className="content-card">
          <h3>Response</h3>
          
          {response.error ? (
            <div style={{ color: '#ef4444' }}>
              <strong>Error:</strong> {response.message}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <strong>Status:</strong>{' '}
                <span 
                  style={{ 
                    color: response.status >= 200 && response.status < 300 ? '#10b981' : '#ef4444',
                    fontWeight: 600
                  }}
                >
                  {response.status} {response.statusText}
                </span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <strong>Headers:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px'
                }}>
                  {JSON.stringify(response.headers, null, 2)}
                </pre>
              </div>

              <div>
                <strong>Body:</strong>
                <pre style={{ 
                  background: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '6px',
                  overflow: 'auto',
                  fontSize: '13px',
                  maxHeight: '400px'
                }}>
                  {typeof response.data === 'string' 
                    ? response.data 
                    : JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTesting;
