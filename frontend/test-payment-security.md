# Frontend Payment Security Testing Guide

## 🧪 **FRONTEND SECURITY TESTING**

### **1. Start Frontend Development Server**
```bash
cd frontend
npm run dev
# or
pnpm dev
```

### **2. Manual Testing Checklist**

#### **✅ Checkout Page Security Tests**

**Test 1: Form Validation**
- [ ] Navigate to `/checkout`
- [ ] Try to submit empty form → Should show validation errors
- [ ] Enter invalid email → Should show email validation error
- [ ] Enter invalid phone → Should show phone validation error
- [ ] Enter short address (< 3 chars) → Should show address validation error
- [ ] Enter invalid amount → Should show amount validation error

**Test 2: Rate Limiting**
- [ ] Try to submit payment multiple times quickly
- [ ] Should see rate limit message after 5 attempts
- [ ] Should show reset time in the error message

**Test 3: CSRF Protection**
- [ ] Open browser developer tools
- [ ] Check network tab during payment submission
- [ ] Verify CSRF token is included in form data
- [ ] Token should be different for each submission

**Test 4: Data Sanitization**
- [ ] Enter data with HTML tags: `<script>alert('xss')</script>`
- [ ] Submit form and check if tags are stripped
- [ ] Check browser console for security logs

**Test 5: Authentication Check**
- [ ] Try to access `/checkout` without logging in
- [ ] Should redirect to login page
- [ ] After login, should redirect back to checkout

**Test 6: Cart Validation**
- [ ] Try to checkout with empty cart
- [ ] Should redirect to cart page
- [ ] Should show appropriate error message

#### **✅ Success Page Security Tests**

**Test 1: Payment Response Validation**
- [ ] Complete a test payment
- [ ] Check browser console for validation logs
- [ ] Verify payment response is validated
- [ ] Check for security event logs

**Test 2: Amount Validation**
- [ ] Try to manipulate payment amount in URL
- [ ] Should validate amount on frontend
- [ ] Should show error for invalid amounts

**Test 3: Status Validation**
- [ ] Try to access success page with failed payment
- [ ] Should show appropriate error message
- [ ] Should not proceed with stock update

**Test 4: Backend Verification**
- [ ] Check network tab during payment verification
- [ ] Verify backend verification call is made
- [ ] Check for proper error handling

### **3. Browser Console Testing**

**Check Security Logs:**
```javascript
// In browser console, look for:
[Payment Security] payment_attempt_started
[Payment Security] payment_form_submission
[Payment Security] payment_response_received
[Payment Security] payment_form_submitted
```

**Test Rate Limiting:**
```javascript
// In browser console:
// Check if rate limiting is working
console.log(window.paymentRateLimiter?.getAttempts('test-user-id'));
```

### **4. Network Tab Testing**

**Check API Calls:**
1. Open browser developer tools
2. Go to Network tab
3. Complete a payment flow
4. Verify these calls are made:
   - `POST /api/orders` (order creation)
   - `POST /api/orders/verify-payment` (payment verification)
5. Check request headers for:
   - Authorization token
   - CSRF token
   - Proper content type

### **5. Security Headers Testing**

**Check Security Headers:**
```javascript
// In browser console:
fetch('/api/orders', { method: 'GET' })
  .then(response => {
    console.log('Security Headers:', {
      'content-security-policy': response.headers.get('content-security-policy'),
      'x-frame-options': response.headers.get('x-frame-options'),
      'x-content-type-options': response.headers.get('x-content-type-options'),
      'referrer-policy': response.headers.get('referrer-policy')
    });
  });
```

### **6. XSS Protection Testing**

**Test Input Sanitization:**
```javascript
// In browser console, test form inputs:
const testInputs = [
  '<script>alert("xss")</script>',
  'javascript:alert("xss")',
  '<img src="x" onerror="alert(\'xss\')">',
  '"><script>alert("xss")</script>'
];

testInputs.forEach(input => {
  // Try entering these in form fields
  // Should be sanitized or blocked
});
```

### **7. Environment Testing**

**Development Environment:**
- [ ] Verify lenient security (allows test credentials)
- [ ] Check console logs for development mode indicators
- [ ] Test with invalid signatures (should be allowed)

**Production Environment:**
- [ ] Set `NODE_ENV=production`
- [ ] Verify strict security enforcement
- [ ] Test with invalid signatures (should be blocked)

### **8. Error Handling Testing**

**Test Error Scenarios:**
1. **Network Errors:**
   - Disconnect internet during payment
   - Should show user-friendly error message
   - Should not expose technical details

2. **Server Errors:**
   - Mock 500 error in backend
   - Should show generic error message
   - Should log error for debugging

3. **Validation Errors:**
   - Submit invalid data
   - Should show specific validation errors
   - Should not expose system information

### **9. Performance Testing**

**Test Security Performance:**
```javascript
// In browser console:
console.time('payment-validation');
// Perform payment validation
console.timeEnd('payment-validation');

// Should complete within reasonable time (< 100ms)
```

### **10. Accessibility Testing**

**Test Security with Screen Readers:**
- [ ] Verify error messages are announced
- [ ] Check form validation announcements
- [ ] Test keyboard navigation for security elements

## 🎯 **TESTING CHECKLIST SUMMARY**

### **✅ Security Features to Test:**
- [ ] **Input Validation**: All form fields properly validated
- [ ] **Rate Limiting**: Payment attempts limited to 5 per 15 minutes
- [ ] **CSRF Protection**: Tokens generated and validated
- [ ] **Data Sanitization**: XSS protection working
- [ ] **Authentication**: Proper login checks
- [ ] **Payment Validation**: eSewa response validation
- [ ] **Error Handling**: Secure error messages
- [ ] **Security Logging**: Events properly logged
- [ ] **Session Management**: Secure session handling
- [ ] **Network Security**: HTTPS and proper headers

### **✅ Browser Testing:**
- [ ] **Chrome**: Latest version
- [ ] **Firefox**: Latest version
- [ ] **Safari**: Latest version
- [ ] **Edge**: Latest version
- [ ] **Mobile browsers**: iOS Safari, Chrome Mobile

### **✅ Device Testing:**
- [ ] **Desktop**: Windows, macOS, Linux
- [ ] **Mobile**: iOS, Android
- [ ] **Tablet**: iPad, Android tablets

## 🚀 **AUTOMATED TESTING**

### **Run Frontend Tests:**
```bash
cd frontend
npm test
# or
pnpm test
```

### **Run Security Tests:**
```bash
# Test payment security utilities
npm run test:security
# or
pnpm test:security
```

## 📊 **TESTING RESULTS**

After completing all tests, you should see:
- ✅ All security features working correctly
- ✅ No security vulnerabilities detected
- ✅ Proper error handling and user feedback
- ✅ Comprehensive security logging
- ✅ Performance within acceptable limits

**If all tests pass, your frontend payment security is production-ready!** 🎉 