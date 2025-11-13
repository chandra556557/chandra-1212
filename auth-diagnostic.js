/**
 * 🔍 Authentication Diagnostic Script
 * Run this in browser console to diagnose authentication issues
 */

(async function diagnoseAuth() {
  console.log('🔍 Starting Authentication Diagnosis...\n');
  
  // 1. Check API Service
  console.log('1️⃣ Checking API Service...');
  try {
    const response = await fetch('http://localhost:3001/api/health');
    if (response.ok) {
      console.log('✅ Backend API is accessible');
    } else {
      console.log('❌ Backend API returned error:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend API:', error.message);
    console.log('💡 Make sure backend server is running on http://localhost:3001');
  }
  
  // 2. Check Chrome Storage
  console.log('\n2️⃣ Checking Chrome Storage...');
  try {
    const tokens = await chrome.storage.local.get(['auth_tokens']);
    if (tokens.auth_tokens) {
      console.log('✅ Tokens found in storage:', {
        hasAccessToken: !!tokens.auth_tokens.accessToken,
        hasRefreshToken: !!tokens.auth_tokens.refreshToken
      });
    } else {
      console.log('❌ No tokens found in storage');
    }
  } catch (error) {
    console.log('❌ Chrome storage error:', error.message);
    console.log('💡 Check if extension has storage permissions');
  }
  
  // 3. Test Registration
  console.log('\n3️⃣ Testing User Registration...');
  try {
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'test123',
      name: 'Test User'
    };
    
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Registration successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasTokens: !!(data.accessToken && data.refreshToken)
      });
    } else {
      const error = await response.text();
      console.log('❌ Registration failed:', response.status, error);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }
  
  // 4. Test Login
  console.log('\n4️⃣ Testing User Login...');
  try {
    const loginData = {
      email: 'demo@example.com',
      password: 'demo123'
    };
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        hasTokens: !!(data.accessToken && data.refreshToken)
      });
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', response.status, error);
      console.log('💡 Try registering a new user first');
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  
  // 5. Check Extension Permissions
  console.log('\n5️⃣ Checking Extension Permissions...');
  try {
    const permissions = chrome.runtime.getManifest().permissions;
    console.log('📋 Extension permissions:', permissions);
    
    const hasStorage = permissions.includes('storage');
    const hasActiveTab = permissions.includes('activeTab');
    
    console.log(`${hasStorage ? '✅' : '❌'} Storage permission: ${hasStorage ? 'Granted' : 'Missing'}`);
    console.log(`${hasActiveTab ? '✅' : '❌'} ActiveTab permission: ${hasActiveTab ? 'Granted' : 'Missing'}`);
    
    if (!hasStorage) {
      console.log('💡 Add "storage" to permissions in manifest.json');
    }
  } catch (error) {
    console.log('❌ Cannot check permissions:', error.message);
  }
  
  // 6. Check CORS
  console.log('\n6️⃣ Checking CORS Configuration...');
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'OPTIONS'
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log('🌐 CORS Headers:', corsHeaders);
    
    if (!corsHeaders['Access-Control-Allow-Origin']?.includes('chrome-extension')) {
      console.log('❌ CORS not configured for Chrome extensions');
      console.log('💡 Update backend CORS configuration');
    } else {
      console.log('✅ CORS properly configured');
    }
  } catch (error) {
    console.log('❌ CORS check failed:', error.message);
  }
  
  console.log('\n🎯 Diagnosis Complete!');
  console.log('📋 Summary of issues found above. Check each section for details.');
})();