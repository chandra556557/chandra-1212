const axios = require('axios');

async function testPythonAPIEndpoints() {
  try {
    console.log('Testing Python API endpoints...');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Authentication successful');
    
    // Test assertion suggestions
    console.log('\n🧪 Testing assertion suggestions...');
    try {
      const suggestResponse = await axios.post('http://localhost:3001/api/api-testing/python/assertions/suggest', {
        prompt: 'Test GET /api/users endpoint that returns user list'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Assertion suggestions response:', suggestResponse.data);
    } catch (error) {
      console.log('❌ Assertion suggestions failed:', error.response?.status, error.response?.data?.error);
    }
    
    // Test contract validation
    console.log('\n📋 Testing contract validation...');
    try {
      const contractResponse = await axios.post('http://localhost:3001/api/api-testing/python/contracts/validate', {
        schema: {
          type: 'object',
          properties: {
            users: { type: 'array' }
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Contract validation response:', contractResponse.data);
    } catch (error) {
      console.log('❌ Contract validation failed:', error.response?.status, error.response?.data?.error);
    }
    
    // Test mock generation
    console.log('\n🎭 Testing mock generation...');
    try {
      const mockResponse = await axios.post('http://localhost:3001/api/api-testing/python/mocks/generate', {
        prompt: 'Generate mock data for user API',
        count: 2
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Mock generation response:', mockResponse.data);
    } catch (error) {
      console.log('❌ Mock generation failed:', error.response?.status, error.response?.data?.error);
    }
    
    // Test test execution
    console.log('\n⚡ Testing test execution...');
    try {
      const executeResponse = await axios.post('http://localhost:3001/api/api-testing/python/tests/execute', {
        endpoint: 'GET /api/users',
        testData: { users: [] }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Test execution response:', executeResponse.data);
    } catch (error) {
      console.log('❌ Test execution failed:', error.response?.status, error.response?.data?.error);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPythonAPIEndpoints();