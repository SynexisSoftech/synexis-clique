// Frontend Fake Payment Testing Utility
// This utility helps test payment flows in the frontend without real eSewa integration

export interface FakePaymentTestData {
  transaction_uuid: string;
  total_amount: string;
  product_code: string;
  signature: string;
  status: 'COMPLETE' | 'FAILED' | 'PENDING';
  timestamp: string;
}

export enum FakePaymentTestScenario {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  INVALID_SIGNATURE = 'invalid_signature',
  NETWORK_ERROR = 'network_error'
}

// Generate fake transaction UUID
export const generateFakeTransactionUUID = (): string => {
  return `fake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create fake payment data for frontend testing
export const createFakePaymentData = (
  scenario: FakePaymentTestScenario,
  amount: number = 1000
): FakePaymentTestData => {
  const transaction_uuid = generateFakeTransactionUUID();
  const timestamp = new Date().toISOString();
  
  const baseData = {
    transaction_uuid,
    total_amount: amount.toString(),
    product_code: 'EPAYTEST',
    timestamp
  };

  switch (scenario) {
    case FakePaymentTestScenario.SUCCESS:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: 'valid_signature_for_testing'
      };

    case FakePaymentTestScenario.FAILURE:
      return {
        ...baseData,
        status: 'FAILED',
        signature: 'valid_signature_for_testing'
      };

    case FakePaymentTestScenario.PENDING:
      return {
        ...baseData,
        status: 'PENDING',
        signature: 'valid_signature_for_testing'
      };

    case FakePaymentTestScenario.INVALID_SIGNATURE:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: 'invalid_signature_for_testing'
      };

    case FakePaymentTestScenario.NETWORK_ERROR:
      return {
        ...baseData,
        status: 'PENDING',
        signature: 'valid_signature_for_testing'
      };

    default:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: 'valid_signature_for_testing'
      };
  }
};

// Simulate eSewa payment redirect
export const simulateESewaRedirect = (
  scenario: FakePaymentTestScenario,
  amount: number = 1000,
  orderId?: string
): string => {
  const fakeData = createFakePaymentData(scenario, amount);
  
  // Simulate the URL parameters that eSewa would send
  const urlParams = new URLSearchParams({
    transaction_uuid: fakeData.transaction_uuid,
    total_amount: fakeData.total_amount,
    product_code: fakeData.product_code,
    signature: fakeData.signature,
    status: fakeData.status
  });

  // Redirect to success or failure page based on scenario
  const redirectUrl = scenario === FakePaymentTestScenario.SUCCESS 
    ? `/success?${urlParams.toString()}`
    : `/failure?${urlParams.toString()}`;

  // In a real scenario, this would be a redirect from eSewa
  console.log('🔀 Simulating eSewa redirect to:', redirectUrl);
  console.log('📊 Fake payment data:', fakeData);
  
  // For testing, you can manually navigate to this URL
  // or use window.location.href = redirectUrl;
  
  return redirectUrl;
};

// Test payment verification in frontend
export const testFrontendPaymentVerification = async (
  scenario: FakePaymentTestScenario,
  amount: number = 1000
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const fakeData = createFakePaymentData(scenario, amount);
    
    // Simulate API call to verify payment
    const response = await fetch('/api/orders/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fakeData)
    });

    const result = await response.json();
    
    return {
      success: response.ok,
      data: result,
      error: response.ok ? undefined : result.message
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Create test order data for frontend
export const createFakeOrderData = () => {
  return {
    items: [
      {
        productId: '507f1f77bcf86cd799439013',
        quantity: 2,
        price: 1000
      }
    ],
    shippingInfo: {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '9841234567',
      address: 'Test Address, Kathmandu',
      city: 'Kathmandu',
      postalCode: '44600'
    },
    totalAmount: 2000
  };
};

// Test checkout flow
export const testCheckoutFlow = async (
  scenario: FakePaymentTestScenario = FakePaymentTestScenario.SUCCESS
): Promise<{ success: boolean; orderId?: string; paymentUrl?: string; error?: string }> => {
  try {
    const orderData = createFakeOrderData();
    
    // Step 1: Create order
    const orderResponse = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || 'test_token'}`
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      throw new Error('Failed to create order');
    }

    const orderResult = await orderResponse.json();
    
    // Step 2: Simulate payment
    const paymentUrl = simulateESewaRedirect(scenario, orderData.totalAmount, orderResult.order._id);
    
    return {
      success: true,
      orderId: orderResult.order._id,
      paymentUrl
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Generate test scenarios for frontend
export const getFrontendTestScenarios = () => {
  return [
    {
      name: '✅ Successful Payment',
      scenario: FakePaymentTestScenario.SUCCESS,
      description: 'Simulates a successful payment completion'
    },
    {
      name: '❌ Failed Payment',
      scenario: FakePaymentTestScenario.FAILURE,
      description: 'Simulates a failed payment'
    },
    {
      name: '⏳ Pending Payment',
      scenario: FakePaymentTestScenario.PENDING,
      description: 'Simulates a pending payment status'
    },
    {
      name: '🔒 Invalid Signature',
      scenario: FakePaymentTestScenario.INVALID_SIGNATURE,
      description: 'Simulates payment with invalid signature'
    },
    {
      name: '🌐 Network Error',
      scenario: FakePaymentTestScenario.NETWORK_ERROR,
      description: 'Simulates network error during payment'
    }
  ];
};

// Utility to test payment in browser console
export const testPaymentInConsole = () => {
  console.log('🧪 Frontend Payment Testing Utility');
  console.log('===================================');
  console.log('');
  console.log('Available functions:');
  console.log('1. testCheckoutFlow(scenario) - Test complete checkout flow');
  console.log('2. testFrontendPaymentVerification(scenario, amount) - Test payment verification');
  console.log('3. simulateESewaRedirect(scenario, amount) - Simulate eSewa redirect');
  console.log('4. createFakePaymentData(scenario, amount) - Create fake payment data');
  console.log('');
  console.log('Scenarios:');
  console.log('- FakePaymentTestScenario.SUCCESS');
  console.log('- FakePaymentTestScenario.FAILURE');
  console.log('- FakePaymentTestScenario.PENDING');
  console.log('- FakePaymentTestScenario.INVALID_SIGNATURE');
  console.log('- FakePaymentTestScenario.NETWORK_ERROR');
  console.log('');
  console.log('Example usage:');
  console.log('testCheckoutFlow(FakePaymentTestScenario.SUCCESS)');
  console.log('testFrontendPaymentVerification(FakePaymentTestScenario.SUCCESS, 1000)');
};

// Export for use in components
export default {
  createFakePaymentData,
  simulateESewaRedirect,
  testFrontendPaymentVerification,
  testCheckoutFlow,
  getFrontendTestScenarios,
  testPaymentInConsole
}; 