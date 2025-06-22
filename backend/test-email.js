const { sendOrderConfirmationEmail } = require('./dist/services/email.service');

async function testEmail() {
  try {
    console.log('🧪 Testing order confirmation email...');
    
    const testEmailData = {
      orderId: 'TEST-ORDER-123',
      customerName: 'John Doe',
      customerEmail: 'test@example.com', // Replace with your email for testing
      orderItems: [
        {
          productTitle: 'Test Product 1',
          quantity: 2,
          price: 1000
        },
        {
          productTitle: 'Test Product 2',
          quantity: 1,
          price: 500
        }
      ],
      totalAmount: 2500,
      shippingCharge: 200,
      tax: 195,
      subtotal: 2105,
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        address: '123 Test Street',
        city: 'Kathmandu',
        province: 'Bagmati',
        postalCode: '44600',
        country: 'Nepal'
      },
      transactionId: 'TEST-TXN-123',
      orderDate: new Date()
    };

    console.log('📧 Sending test email with data:', testEmailData);
    
    await sendOrderConfirmationEmail(testEmailData);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your email inbox for the test email.');
    
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.error('🔧 Make sure your email configuration is set up in .env file:');
    console.error('   EMAIL_HOST=smtp.gmail.com');
    console.error('   EMAIL_PORT=587');
    console.error('   EMAIL_USER=your-email@gmail.com');
    console.error('   EMAIL_PASS=your-app-password');
    console.error('   EMAIL_FROM=your-email@gmail.com');
  }
}

console.log(`
🔧 EMAIL TESTING INSTRUCTIONS:

1. Make sure your backend is built: npm run build
2. Update the customerEmail in this script to your email address
3. Ensure your .env file has email configuration:
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com

4. Run this test: node test-email.js

5. Check your email inbox for the test email
`);

testEmail(); 