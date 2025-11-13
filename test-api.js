const axios = require('axios');

async function testAPI() {
  try {
    console.log('Testing backend server...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('Health check:', healthResponse.data);
    
    // Test login
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'demo@example.com',
      password: 'demo123'
    });
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.accessToken;
    
    // Test Python API endpoint
    const pythonResponse = await axios.post('http://localhost:3001/api/api-testing/python/assertions/suggest', {
      prompt: 'Test endpoint'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Python API response:', pythonResponse.data);
    
  } catch (error) {
    console.error('API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();