const mongoose = require('mongoose');
const { Product } = require('./dist/models/product.model');
const { Order } = require('./dist/models/order.model');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/default_db';

async function testStockReduction() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a product to test with
    const testProduct = await Product.findOne({ stockQuantity: { $gt: 0 } });
    
    if (!testProduct) {
      console.log('❌ No products with stock found. Please add some products first.');
      return;
    }

    console.log(`📦 Testing with product: ${testProduct.title}`);
    console.log(`📊 Initial stock: ${testProduct.stockQuantity}`);

    // Create a test order
    const testOrder = new Order({
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      items: [{
        productId: testProduct._id,
        quantity: 2,
        price: testProduct.discountPrice || testProduct.originalPrice
      }],
      transaction_uuid: 'test-transaction-' + Date.now(),
      amount: (testProduct.discountPrice || testProduct.originalPrice) * 2,
      totalAmount: (testProduct.discountPrice || testProduct.originalPrice) * 2,
      status: 'PENDING',
      shippingInfo: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
        address: 'Test Address',
        province: 'Test Province',
        city: 'Test City',
        postalCode: '12345',
        country: 'Nepal'
      },
      shippingCharge: 0,
      tax: 0
    });

    await testOrder.save();
    console.log(`📋 Test order created: ${testOrder._id}`);

    // Simulate payment verification
    const verifyPayment = async (orderId, transactionUuid) => {
      const order = await Order.findOne({ transaction_uuid: transactionUuid });
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.status === 'COMPLETED') {
        console.log('Order already completed');
        return;
      }

      // Start transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update order status
        order.status = 'COMPLETED';
        order.eSewaRefId = 'test-ref-id';
        await order.save({ session });

        // Reduce stock
        for (const item of order.items) {
          const product = await Product.findById(item.productId).session(session);
          
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }

          if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for product: ${product.title}`);
          }

          product.stockQuantity -= item.quantity;
          
          if (product.stockQuantity === 0) {
            product.status = 'out-of-stock';
          }

          await product.save({ session });
          console.log(`📉 Reduced stock for ${product.title}: ${item.quantity} units`);
        }

        await session.commitTransaction();
        console.log('✅ Payment verification completed successfully');

      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    };

    // Test the verification
    await verifyPayment(testOrder._id, testOrder.transaction_uuid);

    // Check final stock
    const updatedProduct = await Product.findById(testProduct._id);
    console.log(`📊 Final stock: ${updatedProduct.stockQuantity}`);

    // Clean up test order
    await Order.findByIdAndDelete(testOrder._id);
    console.log('🧹 Test order cleaned up');

    console.log('✅ Stock reduction test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testStockReduction(); 