const axios = require('axios');
const crypto = require('crypto');

// Test configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // Replace with actual test user ID
const TEST_ORDER_ID = '507f1f77bcf86cd799439012'; // Replace with actual test order ID

// eSewa test configuration
const ESEWA_CONFIG = {
  SECRET_KEY: "8gBm/:&EnhH.1/q",
  PRODUCT_CODE: "EPAYTEST",
  MERCHANT_ID: "EPAYTEST"
};

// Generate fake transaction UUID
const generateFakeTransactionUUID = () => {
  // Generate a proper UUID v4 format
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid;
};

// Generate fake signature
const generateFakeSignature = (data, useValidSignature = true) => {
  if (!useValidSignature) {
    return 'invalid_signature_for_testing';
  }

  const total_amount = data.total_amount || data.totalAmount;
  const transaction_uuid = data.transaction_uuid || data.transactionUuid;
  const transaction_code = data.transaction_code || ESEWA_CONFIG.PRODUCT_CODE;

  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${transaction_code}`;
  
  return crypto
    .createHmac("sha256", ESEWA_CONFIG.SECRET_KEY)
    .update(message)
    .digest("base64");
};

// Create fake payment data
const createFakePaymentData = (scenario, amount = 1000) => {
  const transaction_uuid = generateFakeTransactionUUID();
  const timestamp = new Date().toISOString();
  
  const baseData = {
    transaction_uuid,
    total_amount: amount.toString(),
    transaction_code: ESEWA_CONFIG.PRODUCT_CODE,
    timestamp,
    user_id: TEST_USER_ID,
    order_id: TEST_ORDER_ID
  };

  switch (scenario) {
    case 'success':
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, true)
      };

    case 'failure':
      return {
        ...baseData,
        status: 'FAILED',
        signature: generateFakeSignature(baseData, true)
      };

    case 'pending':
      return {
        ...baseData,
        status: 'PENDING',
        signature: generateFakeSignature(baseData, true)
      };

    case 'invalid_signature':
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, false)
      };

    case 'invalid_amount':
      return {
        ...baseData,
        total_amount: '0',
        status: 'COMPLETE',
        signature: generateFakeSignature({ ...baseData, total_amount: '0' }, true)
      };

    case 'duplicate_transaction':
      return {
        ...baseData,
        transaction_uuid: '12345678-1234-4123-8234-123456789abc', // Fixed UUID for duplicate testing
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, true)
      };

    case 'expired_transaction':
      const expiredTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      return {
        ...baseData,
        timestamp: expiredTimestamp,
        status: 'COMPLETE',
        signature: generateFakeSignature({ ...baseData, timestamp: expiredTimestamp }, true)
      };

    default:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, true)
      };
  }
};

// Test scenarios
const testScenarios = [
  {
    name: '✅ Successful Payment',
    scenario: 'success',
    amount: 1000,
    expectedResult: 'Payment verified successfully'
  },
  {
    name: '❌ Failed Payment',
    scenario: 'failure',
    amount: 1000,
    expectedResult: 'Payment failed'
  },
  {
    name: '⏳ Pending Payment',
    scenario: 'pending',
    amount: 1000,
    expectedResult: 'Payment pending'
  },
  {
    name: '🔒 Invalid Signature',
    scenario: 'invalid_signature',
    amount: 1000,
    expectedResult: 'Invalid signature'
  },
  {
    name: '💰 Invalid Amount',
    scenario: 'invalid_amount',
    amount: 0,
    expectedResult: 'Invalid amount'
  },
  {
    name: '🔄 Duplicate Transaction',
    scenario: 'duplicate_transaction',
    amount: 1000,
    expectedResult: 'Duplicate transaction'
  },
  {
    name: '⏰ Expired Transaction',
    scenario: 'expired_transaction',
    amount: 1000,
    expectedResult: 'Transaction expired'
  }
];

// Test payment verification endpoint
const testPaymentVerification = async (scenario, amount) => {
  try {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log(`📊 Amount: Rs. ${amount}`);
    
    const fakeData = createFakePaymentData(scenario.scenario, amount);
    
    console.log('📤 Sending fake payment data:', {
      transaction_uuid: fakeData.transaction_uuid,
      total_amount: fakeData.total_amount,
      status: fakeData.status,
      signature: fakeData.signature.substring(0, 20) + '...'
    });

    // Test the payment verification endpoint
    const response = await axios.post(`${BASE_URL}/orders/verify-payment`, fakeData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '127.0.0.1', // Simulate local IP for development
        'X-Timestamp': fakeData.timestamp
      },
      timeout: 10000
    });

    console.log('✅ Response received:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message
    });

    return {
      success: true,
      scenario: scenario.name,
      response: response.data
    };

  } catch (error) {
    console.log('❌ Error occurred:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    return {
      success: false,
      scenario: scenario.name,
      error: error.response?.data?.message || error.message
    };
  }
};

// Test order creation with fake payment
const testOrderCreation = async () => {
  try {
    console.log('\n🛒 Testing Order Creation with Fake Payment');
    
    const orderData = {
      items: [
        {
          productId: '507f1f77bcf86cd799439013',
          quantity: 2
        }
      ],
      shippingInfo: {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '9841234567',
        address: 'Test Address, Kathmandu',
        city: 'Kathmandu',
        postalCode: '44600'
      }
    };

    console.log('📤 Creating order with data:', orderData);

    const response = await axios.post(`${BASE_URL}/orders`, orderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TEST_TOKEN_HERE' // Replace with actual test token
      },
      timeout: 10000
    });

    console.log('✅ Order created successfully:', {
      orderId: response.data.order._id,
      paymentUrl: response.data.paymentUrl,
      transactionId: response.data.transactionId
    });

    return response.data;

  } catch (error) {
    console.log('❌ Order creation failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return null;
  }
};

// Test eSewa webhook simulation
const testESewaWebhook = async (scenario, amount) => {
  try {
    console.log(`\n🌐 Testing eSewa Webhook: ${scenario.name}`);
    
    const fakeData = createFakePaymentData(scenario.scenario, amount);
    
    // Simulate eSewa webhook call
    const webhookResponse = await axios.post(`${BASE_URL}/orders/esewa-webhook`, fakeData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '103.21.244.1', // Simulate eSewa IP
        'X-Timestamp': fakeData.timestamp,
        'User-Agent': 'eSewa-Webhook/1.0'
      },
      timeout: 10000
    });

    console.log('✅ Webhook response:', {
      status: webhookResponse.status,
      success: webhookResponse.data.success,
      message: webhookResponse.data.message
    });

    return {
      success: true,
      scenario: scenario.name,
      response: webhookResponse.data
    };

  } catch (error) {
    console.log('❌ Webhook test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    return {
      success: false,
      scenario: scenario.name,
      error: error.response?.data?.message || error.message
    };
  }
};

// Main test runner
const runFakePaymentTests = async () => {
  console.log('🚀 Starting Fake Payment Testing Suite');
  console.log('=====================================');
  
  const results = {
    total: testScenarios.length,
    passed: 0,
    failed: 0,
    details: []
  };

  // Test 1: Order Creation
  console.log('\n📋 Test 1: Order Creation');
  const orderResult = await testOrderCreation();
  if (orderResult) {
    console.log('✅ Order creation test passed');
  } else {
    console.log('❌ Order creation test failed');
  }

  // Test 2: Payment Verification Scenarios
  console.log('\n📋 Test 2: Payment Verification Scenarios');
  for (const scenario of testScenarios) {
    const result = await testPaymentVerification(scenario, scenario.amount);
    results.details.push(result);
    
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Test 3: eSewa Webhook Simulation
  console.log('\n📋 Test 3: eSewa Webhook Simulation');
  const webhookResults = [];
  for (const scenario of testScenarios.slice(0, 3)) { // Test first 3 scenarios
    const result = await testESewaWebhook(scenario, scenario.amount);
    webhookResults.push(result);
  }

  // Test 4: Manual Payment Simulation
  console.log('\n📋 Test 4: Manual Payment Simulation');
  console.log('💡 You can manually test payments using these curl commands:');
  
  testScenarios.forEach((scenario, index) => {
    const fakeData = createFakePaymentData(scenario.scenario, scenario.amount);
    console.log(`\n${index + 1}. ${scenario.name}:`);
    console.log(`curl -X POST ${BASE_URL}/orders/verify-payment \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "X-Forwarded-For: 127.0.0.1" \\`);
    console.log(`  -d '${JSON.stringify(fakeData, null, 2)}'`);
  });

  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  // Detailed results
  console.log('\n📋 Detailed Results:');
  results.details.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.scenario}`);
    if (!result.success) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n🎉 Fake Payment Testing Complete!');
  console.log('\n💡 Tips for testing:');
  console.log('1. Make sure your backend server is running on port 5000');
  console.log('2. Update TEST_USER_ID and TEST_ORDER_ID with actual values');
  console.log('3. Use the curl commands above for manual testing');
  console.log('4. Check your database for order updates after tests');
  console.log('5. Monitor your server logs for detailed information');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runFakePaymentTests().catch(console.error);
}

module.exports = {
  createFakePaymentData,
  testPaymentVerification,
  testOrderCreation,
  testESewaWebhook,
  runFakePaymentTests
}; 