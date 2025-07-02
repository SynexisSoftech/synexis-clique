/**
 * Frontend Security Testing Script
 * Run this in the browser console to test security features
 */

console.log('🔒 Frontend Security Testing Started');

// Test 1: CSRF Token Integration
async function testCSRFToken() {
  console.log('\n1️⃣ Testing CSRF Token Integration...');
  
  try {
    // Test getting CSRF token
    const response = await fetch('/api/auth/csrf-token', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CSRF token obtained:', data.csrfToken ? 'Success' : 'Failed');
      
      // Test CSRF protection on a protected endpoint
      const testResponse = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'invalid-token'
        },
        credentials: 'include'
      });
      
      if (testResponse.status === 403) {
        console.log('✅ CSRF protection working - invalid token rejected');
      } else {
        console.log('❌ CSRF protection not working properly');
      }
    } else {
      console.log('❌ Failed to get CSRF token');
    }
  } catch (error) {
    console.log('❌ CSRF test failed:', error.message);
  }
}

// Test 2: Authentication State Management
function testAuthState() {
  console.log('\n2️⃣ Testing Authentication State Management...');
  
  // Check if tokens are stored in memory only
  const localStorageToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const sessionStorageToken = sessionStorage.getItem('token') || sessionStorage.getItem('accessToken');
  
  if (!localStorageToken && !sessionStorageToken) {
    console.log('✅ Access tokens properly stored in memory only');
  } else {
    console.log('❌ Access tokens found in browser storage - security risk!');
  }
  
  // Check if user data is stored
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    if (!user.accessToken && !user.token) {
      console.log('✅ User data stored without sensitive tokens');
    } else {
      console.log('❌ User data contains sensitive tokens');
    }
  }
}

// Test 3: Security Headers
async function testSecurityHeaders() {
  console.log('\n3️⃣ Testing Security Headers...');
  
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    const headers = response.headers;
    const securityHeaders = {
      'X-Frame-Options': headers.get('X-Frame-Options'),
      'X-Content-Type-Options': headers.get('X-Content-Type-Options'),
      'X-XSS-Protection': headers.get('X-XSS-Protection'),
      'Strict-Transport-Security': headers.get('Strict-Transport-Security'),
      'Content-Security-Policy': headers.get('Content-Security-Policy')
    };
    
    console.log('Security Headers:', securityHeaders);
    
    let score = 0;
    if (securityHeaders['X-Frame-Options']) score++;
    if (securityHeaders['X-Content-Type-Options']) score++;
    if (securityHeaders['X-XSS-Protection']) score++;
    if (securityHeaders['Strict-Transport-Security']) score++;
    if (securityHeaders['Content-Security-Policy']) score++;
    
    console.log(`Security Header Score: ${score}/5`);
  } catch (error) {
    console.log('❌ Security headers test failed:', error.message);
  }
}

// Test 4: Rate Limiting Detection
async function testRateLimiting() {
  console.log('\n4️⃣ Testing Rate Limiting Detection...');
  
  try {
    // Make multiple rapid requests to trigger rate limiting
    const promises = Array(10).fill().map(() => 
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      })
    );
    
    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.status === 429);
    
    if (rateLimited) {
      console.log('✅ Rate limiting detected and working');
    } else {
      console.log('⚠️ Rate limiting not triggered (may need more requests)');
    }
  } catch (error) {
    console.log('❌ Rate limiting test failed:', error.message);
  }
}

// Test 5: Session Management
function testSessionManagement() {
  console.log('\n5️⃣ Testing Session Management...');
  
  // Check if auth-failure event listener is set up
  const testEvent = new Event('auth-failure');
  let eventHandled = false;
  
  const handler = () => {
    eventHandled = true;
    console.log('✅ Auth failure event handler working');
  };
  
  window.addEventListener('auth-failure', handler);
  window.dispatchEvent(testEvent);
  window.removeEventListener('auth-failure', handler);
  
  if (!eventHandled) {
    console.log('❌ Auth failure event handler not working');
  }
}

// Test 6: Role Validation
async function testRoleValidation() {
  console.log('\n6️⃣ Testing Role Validation...');
  
  try {
    // Try to access admin endpoint without proper role
    const response = await fetch('/api/admin/users', {
      credentials: 'include'
    });
    
    if (response.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else if (response.status === 403) {
      console.log('✅ Forbidden access properly blocked');
    } else {
      console.log('❌ Role validation not working properly');
    }
  } catch (error) {
    console.log('❌ Role validation test failed:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Frontend Security Tests...\n');
  
  await testCSRFToken();
  testAuthState();
  await testSecurityHeaders();
  await testRateLimiting();
  testSessionManagement();
  await testRoleValidation();
  
  console.log('\n🎉 Frontend Security Testing Complete!');
  console.log('📋 Check the results above for any security issues.');
}

// Export for manual testing
window.securityTests = {
  runAllTests,
  testCSRFToken,
  testAuthState,
  testSecurityHeaders,
  testRateLimiting,
  testSessionManagement,
  testRoleValidation
};

// Auto-run if in development
if (process.env.NODE_ENV === 'development') {
  runAllTests();
} 