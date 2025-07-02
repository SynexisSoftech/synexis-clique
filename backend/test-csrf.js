/**
 * CSRF Protection Test Script
 * Run this to test CSRF token functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCSRF() {
  console.log('🔒 Testing CSRF Protection...\n');

  try {
    // Step 1: Get CSRF token
    console.log('1️⃣ Getting CSRF token...');
    const tokenResponse = await axios.get(`${BASE_URL}/api/auth/csrf-token`, {
      withCredentials: true
    });
    
    const { csrfToken, sessionId } = tokenResponse.data;
    console.log('✅ CSRF Token obtained:', csrfToken ? 'Success' : 'Failed');
    console.log('📝 Session ID:', sessionId);

    // Step 2: Test CSRF protection with valid token
    console.log('\n2️⃣ Testing with valid CSRF token...');
    try {
      const validResponse = await axios.put(`${BASE_URL}/api/auth/profile`, {
        firstName: 'Test',
        lastName: 'User'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token', // This will fail auth, but CSRF should pass
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true
      });
      console.log('❌ Unexpected success - should have failed auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ CSRF passed, auth failed (expected)');
      } else if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        console.log('❌ CSRF failed with valid token');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 3: Test CSRF protection with invalid token
    console.log('\n3️⃣ Testing with invalid CSRF token...');
    try {
      await axios.put(`${BASE_URL}/api/auth/profile`, {
        firstName: 'Test',
        lastName: 'User'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'X-CSRF-Token': 'invalid-token'
        },
        withCredentials: true
      });
      console.log('❌ CSRF protection failed - invalid token was accepted');
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
        console.log('✅ CSRF protection working - invalid token rejected');
      } else if (error.response?.status === 403 && error.response?.data?.error === 'CSRF_SESSION_MISSING') {
        console.log('✅ CSRF protection working - session missing');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Step 4: Test CSRF protection without token
    console.log('\n4️⃣ Testing without CSRF token...');
    try {
      await axios.put(`${BASE_URL}/api/auth/profile`, {
        firstName: 'Test',
        lastName: 'User'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        },
        withCredentials: true
      });
      console.log('❌ CSRF protection failed - request without token was accepted');
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
  }
}

// Run the test
testCSRF(); 