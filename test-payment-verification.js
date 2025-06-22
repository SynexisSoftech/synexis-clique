const fetch = require('node-fetch');

async function testPaymentVerification() {
  try {
    console.log('🧪 Testing payment verification endpoint...');
    
    // Test data - you'll need to replace these with actual values from your database
    const testData = {
      transaction_uuid: "test-transaction-123", // Replace with actual transaction_uuid from your order
      transaction_code: "TEST123",
      status: "COMPLETE",
      total_amount: "1000",
      signature: "test-signature"
    };

    console.log('📊 Sending test data:', testData);

    const response = await fetch('http://localhost:3001/api/orders/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('📡 Response body:', responseText);

    if (response.ok) {
      console.log('✅ Payment verification test successful!');
    } else {
      console.log('❌ Payment verification test failed!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for manual testing
console.log(`
🔧 MANUAL TESTING INSTRUCTIONS:

1. Make sure your backend is running on port 3001
2. Create a test order in your database
3. Update the testData object with actual values:
   - transaction_uuid: Get this from your order document
   - transaction_code: Any test value
   - status: "COMPLETE"
   - total_amount: The order total
   - signature: Any test value

4. Run this script: node test-payment-verification.js

5. Check the backend logs for detailed information
`);

testPaymentVerification(); 