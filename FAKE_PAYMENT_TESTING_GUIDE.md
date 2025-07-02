# Fake Payment Testing Guide for eSewa Integration

This guide provides comprehensive instructions for testing your eSewa payment integration using fake payment data without requiring real eSewa transactions.

## 🚀 Quick Start

### 1. Backend Testing

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server
npm run dev

# In another terminal, run the fake payment tests
node test-fake-payment.js
```

### 2. Frontend Testing

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev

# Open browser console and run:
testPaymentInConsole()
```

## 📋 Test Scenarios

### Backend Test Scenarios

| Scenario | Description | Expected Result |
|----------|-------------|-----------------|
| ✅ Success | Valid payment with correct signature | Payment verified successfully |
| ❌ Failure | Payment marked as failed | Payment failed |
| ⏳ Pending | Payment in pending state | Payment pending |
| 🔒 Invalid Signature | Payment with wrong signature | Invalid signature error |
| 💰 Invalid Amount | Payment with zero amount | Invalid amount error |
| 🔄 Duplicate Transaction | Same transaction ID used twice | Duplicate transaction error |
| ⏰ Expired Transaction | Transaction older than 5 minutes | Transaction expired error |
| 🌐 Network Error | Simulated network failure | Network error |

### Frontend Test Scenarios

| Scenario | Description | Expected Result |
|----------|-------------|-----------------|
| ✅ Success | Complete checkout flow | Redirect to success page |
| ❌ Failure | Failed payment flow | Redirect to failure page |
| ⏳ Pending | Pending payment status | Show pending message |
| 🔒 Invalid Signature | Invalid signature handling | Show error message |
| 🌐 Network Error | Network issues | Show error message |

## 🛠️ Manual Testing

### 1. Using cURL Commands

```bash
# Test successful payment
curl -X POST http://localhost:5000/api/orders/verify-payment \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 127.0.0.1" \
  -d '{
    "transaction_uuid": "fake_1234567890_abc123",
    "total_amount": "1000",
    "product_code": "EPAYTEST",
    "signature": "valid_signature_here",
    "status": "COMPLETE",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }'

# Test failed payment
curl -X POST http://localhost:5000/api/orders/verify-payment \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 127.0.0.1" \
  -d '{
    "transaction_uuid": "fake_1234567890_def456",
    "total_amount": "1000",
    "product_code": "EPAYTEST",
    "signature": "valid_signature_here",
    "status": "FAILED",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }'
```

### 2. Using Postman

1. **Create Order Test**
   - Method: `POST`
   - URL: `http://localhost:5000/api/orders`
   - Headers: 
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_TOKEN`
   - Body:
   ```json
   {
     "items": [
       {
         "productId": "507f1f77bcf86cd799439013",
         "quantity": 2
       }
     ],
     "shippingInfo": {
       "fullName": "Test User",
       "email": "test@example.com",
       "phone": "9841234567",
       "address": "Test Address, Kathmandu",
       "city": "Kathmandu",
       "postalCode": "44600"
     }
   }
   ```

2. **Verify Payment Test**
   - Method: `POST`
   - URL: `http://localhost:5000/api/orders/verify-payment`
   - Headers:
     - `Content-Type: application/json`
     - `X-Forwarded-For: 127.0.0.1`
   - Body: Use the fake payment data from the test scenarios

### 3. Browser Console Testing

```javascript
// Test successful payment
testCheckoutFlow(FakePaymentTestScenario.SUCCESS);

// Test failed payment
testCheckoutFlow(FakePaymentTestScenario.FAILURE);

// Test payment verification
testFrontendPaymentVerification(FakePaymentTestScenario.SUCCESS, 1000);

// Simulate eSewa redirect
simulateESewaRedirect(FakePaymentTestScenario.SUCCESS, 1000);
```

## 🔧 Configuration

### Backend Configuration

Update `backend/src/config/esewa.config.ts` for testing:

```typescript
// Development settings (already configured)
ENABLE_STRICT_SIGNATURE: false,
ENABLE_IP_WHITELIST: false,
ENABLE_TIMESTAMP_VALIDATION: false,
```

### Test Data Configuration

Update test files with your actual data:

```javascript
// In test-fake-payment.js
const TEST_USER_ID = 'YOUR_ACTUAL_USER_ID';
const TEST_ORDER_ID = 'YOUR_ACTUAL_ORDER_ID';
const BASE_URL = 'http://localhost:5000/api';
```

## 📊 Expected Test Results

### Backend Tests

```
🚀 Starting Fake Payment Testing Suite
=====================================

📋 Test 1: Order Creation
✅ Order creation test passed

📋 Test 2: Payment Verification Scenarios
🧪 Testing: ✅ Successful Payment
📊 Amount: Rs. 1000
✅ Response received: { status: 200, success: true, message: "Payment verified successfully" }

🧪 Testing: ❌ Failed Payment
📊 Amount: Rs. 1000
✅ Response received: { status: 200, success: false, message: "Payment failed" }

📊 Test Results Summary
======================
Total Tests: 7
Passed: 7 ✅
Failed: 0 ❌
Success Rate: 100.0%
```

### Frontend Tests

```
🧪 Frontend Payment Testing Utility
===================================

✅ Successful Payment: Redirect to /success with payment data
❌ Failed Payment: Redirect to /failure with error data
⏳ Pending Payment: Show pending status
🔒 Invalid Signature: Show error message
🌐 Network Error: Show network error message
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5000
   ```
   **Solution**: Start the backend server with `npm run dev`

2. **Authentication Error**
   ```
   Error: Unauthorized
   ```
   **Solution**: Update the test token in the test files

3. **Invalid User/Order ID**
   ```
   Error: User not found
   ```
   **Solution**: Update TEST_USER_ID and TEST_ORDER_ID with valid IDs

4. **Signature Verification Failed**
   ```
   Error: Invalid signature
   ```
   **Solution**: Check that signature generation matches eSewa's algorithm

### Debug Mode

Enable debug logging in your backend:

```typescript
// In your order controller
console.log('[DEBUG] Payment verification data:', req.body);
console.log('[DEBUG] Generated signature:', expectedSignature);
console.log('[DEBUG] Received signature:', signature);
```

## 🔒 Security Testing

### Test Security Features

1. **IP Whitelisting**
   ```bash
   # Test with non-whitelisted IP
   curl -X POST http://localhost:5000/api/orders/verify-payment \
     -H "X-Forwarded-For: 192.168.1.1" \
     -d '{"test": "data"}'
   ```

2. **Rate Limiting**
   ```bash
   # Send multiple requests quickly
   for i in {1..20}; do
     curl -X POST http://localhost:5000/api/orders/verify-payment \
       -H "Content-Type: application/json" \
       -d '{"test": "data"}'
   done
   ```

3. **Input Validation**
   ```bash
   # Test with invalid data
   curl -X POST http://localhost:5000/api/orders/verify-payment \
     -H "Content-Type: application/json" \
     -d '{"invalid": "data"}'
   ```

## 📝 Test Checklist

### Backend Testing
- [ ] Server starts without errors
- [ ] All test scenarios pass
- [ ] Database transactions work correctly
- [ ] Stock reduction works properly
- [ ] Email notifications are sent
- [ ] Audit logging is working
- [ ] Security features are active

### Frontend Testing
- [ ] Checkout flow works
- [ ] Payment verification works
- [ ] Success/failure pages display correctly
- [ ] Error handling works
- [ ] Loading states work
- [ ] Form validation works

### Integration Testing
- [ ] End-to-end payment flow works
- [ ] Order status updates correctly
- [ ] User receives confirmation emails
- [ ] Admin can see orders
- [ ] Payment logs are created

## 🎯 Advanced Testing

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test scenario
artillery quick --count 100 --num 10 http://localhost:5000/api/orders/verify-payment
```

### Stress Testing

```bash
# Test with concurrent requests
for i in {1..50}; do
  node test-fake-payment.js &
done
wait
```

### Database Testing

```bash
# Check order creation
mongo your_database --eval "db.orders.find().sort({createdAt: -1}).limit(5)"

# Check payment logs
mongo your_database --eval "db.paymentlogs.find().sort({createdAt: -1}).limit(5)"
```

## 📞 Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your configuration settings
3. Ensure all dependencies are installed
4. Check that your database is running
5. Verify network connectivity

## 🔄 Continuous Testing

Set up automated testing:

```bash
# Add to package.json scripts
{
  "scripts": {
    "test:payment": "node test-fake-payment.js",
    "test:all": "npm run test && npm run test:payment"
  }
}
```

Run tests automatically:
```bash
npm run test:payment
```

This comprehensive testing guide ensures your eSewa integration is thoroughly tested before going live! 