const testAuth = async () => {
  try {
    // Test registration
    console.log('Testing registration...');
    const registerResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123!',
        name: 'Test User'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration response:', registerData);
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
      
      // Test login
      console.log('Testing login...');
      const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: `newuser${Date.now()}@example.com`,
          password: 'test123'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('Login response:', loginData);
      
      if (loginResponse.ok) {
        console.log('✅ Login successful!');
        console.log('Access Token:', loginData.accessToken?.substring(0, 20) + '...');
        console.log('Refresh Token:', loginData.refreshToken?.substring(0, 20) + '...');
      } else {
        console.log('❌ Login failed:', loginData.error);
      }
    } else {
      console.log('❌ Registration failed:', registerData.error);
    }
  } catch (error) {
    console.error('❌ Error testing authentication:', error.message);
  }
};

testAuth();