/**
 * CSRF Protection Test Script with Authentication
 * Run this to test CSRF token functionality with a real user
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCSRFWithAuth() {
  console.log('🔒 Testing CSRF Protection with Authentication...\n');

  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const tokenResponse = await axios.get(`${BASE_URL}/api/auth/csrf-token`, {
      withCredentials: true
    });
    
    const { csrfToken, sessionId } = tokenResponse.data;
    console.log('✅ CSRF Token obtained:', csrfToken ? 'Success' : 'Failed');
    console.log('📝 Session ID:', sessionId);

    // Step 2: Login to get a valid token
    console.log('\n2️⃣ Logging in to get valid token...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com', // Use a test admin account
      password: 'admin123'
    }, {
      withCredentials: true
    });

    const accessToken = loginResponse.data.accessToken;
    console.log('✅ Login successful, got access token');

    // Step 3: Test CSRF protection with valid token and valid CSRF
    console.log('\n3️⃣ Testing with valid token and valid CSRF...');
    try {
      const validResponse = await axios.put(`${BASE_URL}/api/auth/profile`, {
        firstName: 'Test',
        lastName: 'User'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      });
      console.log('✅ Request successful with valid token and CSRF');
    } catch (error) {
      console.log('❌ Request failed:', error.response?.status, error.response?.data);
    }

    // Step 4: Test CSRF protection with valid token but invalid CSRF
    console.log('\n4️⃣ Testing with valid token but invalid CSRF...');
    try {
      await axios.put(`${BASE_URL}/api/auth/profile`, {
        firstName: 'Test',
        lastName: 'User'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRF-Token': 'invalid-csrf-token'
        },
        withCredentials: true
      });
      console.log('❌ CSRF protection failed - invalid token was accepted');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        console.log('✅ CSRF protection working - invalid token rejected');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 5: Test CSRF protection with valid token but no CSRF
    console.log('\n5️⃣ Testing with valid token but no CSRF...');
    try {
      await axios.put(`${BASE_URL}/api/auth/profile`, {
        firstName: 'Test',
        lastName: 'User'
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      });
      console.log('❌ CSRF protection failed - request without CSRF was accepted');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_TOKEN_MISSING') {
        console.log('✅ CSRF protection working - missing token rejected');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    console.log('\n🎉 CSRF Protection Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
  }
}

// Run the test
testCSRFWithAuth(); 