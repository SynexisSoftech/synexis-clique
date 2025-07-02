import crypto from 'crypto';
import { ESEWA_CONFIG } from '../config/esewa.config';

// Fake payment test data generator
export interface FakePaymentData {
  transaction_uuid: string;
  total_amount: string;
  transaction_code: string; // Changed from product_code to match validation
  signature: string;
  status: 'COMPLETE' | 'FAILED' | 'PENDING';
  timestamp: string;
  user_id?: string;
  order_id?: string;
}

// Fake payment scenarios for testing
export enum FakePaymentScenario {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  INVALID_SIGNATURE = 'invalid_signature',
  INVALID_AMOUNT = 'invalid_amount',
  DUPLICATE_TRANSACTION = 'duplicate_transaction',
  EXPIRED_TRANSACTION = 'expired_transaction',
  NETWORK_ERROR = 'network_error'
}

// Generate fake transaction UUID
export const generateFakeTransactionUUID = (): string => {
  // Generate a proper UUID v4 format
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  return uuid;
};

// Generate fake signature for testing
export const generateFakeSignature = (data: any, useValidSignature: boolean = true): string => {
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

// Create fake payment data based on scenario
export const createFakePaymentData = (
  scenario: FakePaymentScenario,
  amount: number = 1000,
  userId?: string,
  orderId?: string
): FakePaymentData => {
  const transaction_uuid = generateFakeTransactionUUID();
  const timestamp = new Date().toISOString();
  
  const baseData = {
    transaction_uuid,
    total_amount: amount.toString(),
    transaction_code: ESEWA_CONFIG.PRODUCT_CODE, // Changed from product_code to transaction_code
    timestamp,
    user_id: userId,
    order_id: orderId
  };

  switch (scenario) {
    case FakePaymentScenario.SUCCESS:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, true)
      };

    case FakePaymentScenario.FAILURE:
      return {
        ...baseData,
        status: 'FAILED',
        signature: generateFakeSignature(baseData, true)
      };

    case FakePaymentScenario.PENDING:
      return {
        ...baseData,
        status: 'PENDING',
        signature: generateFakeSignature(baseData, true)
      };

    case FakePaymentScenario.INVALID_SIGNATURE:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, false)
      };

    case FakePaymentScenario.INVALID_AMOUNT:
      return {
        ...baseData,
        total_amount: '0',
        status: 'COMPLETE',
        signature: generateFakeSignature({ ...baseData, total_amount: '0' }, true)
      };

    case FakePaymentScenario.DUPLICATE_TRANSACTION:
      return {
        ...baseData,
        transaction_uuid: '12345678-1234-4123-8234-123456789abc', // Fixed UUID for duplicate testing
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, true)
      };

    case FakePaymentScenario.EXPIRED_TRANSACTION:
      const expiredTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      return {
        ...baseData,
        timestamp: expiredTimestamp,
        status: 'COMPLETE',
        signature: generateFakeSignature({ ...baseData, timestamp: expiredTimestamp }, true)
      };

    case FakePaymentScenario.NETWORK_ERROR:
      return {
        ...baseData,
        status: 'PENDING',
        signature: generateFakeSignature(baseData, true)
      };

    default:
      return {
        ...baseData,
        status: 'COMPLETE',
        signature: generateFakeSignature(baseData, true)
      };
  }
};

// Simulate eSewa webhook response
export const simulateESewaWebhook = (
  scenario: FakePaymentScenario,
  amount: number = 1000,
  userId?: string,
  orderId?: string
): any => {
  const fakeData = createFakePaymentData(scenario, amount, userId, orderId);
  
  // Simulate different response formats based on scenario
  switch (scenario) {
    case FakePaymentScenario.NETWORK_ERROR:
      throw new Error('Network error simulation');
    
    case FakePaymentScenario.EXPIRED_TRANSACTION:
      return {
        ...fakeData,
        error: 'Transaction expired',
        error_code: 'EXPIRED'
      };
    
    default:
      return fakeData;
  }
};

// Test payment verification with fake data
export const testPaymentVerification = async (
  scenario: FakePaymentScenario,
  amount: number = 1000,
  userId?: string,
  orderId?: string
): Promise<{ success: boolean; data: any; error?: string }> => {
  try {
    const fakeData = createFakePaymentData(scenario, amount, userId, orderId);
    
    // Simulate verification process
    const verificationResult = {
      success: scenario === FakePaymentScenario.SUCCESS,
      data: fakeData,
      verified: scenario === FakePaymentScenario.SUCCESS,
      timestamp: new Date().toISOString()
    };

    return verificationResult;
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Generate test cases for comprehensive testing
export const generateTestCases = (): Array<{
  name: string;
  scenario: FakePaymentScenario;
  amount: number;
  expectedResult: string;
}> => {
  return [
    {
      name: 'Successful Payment',
      scenario: FakePaymentScenario.SUCCESS,
      amount: 1000,
      expectedResult: 'Payment verified successfully'
    },
    {
      name: 'Failed Payment',
      scenario: FakePaymentScenario.FAILURE,
      amount: 1000,
      expectedResult: 'Payment failed'
    },
    {
      name: 'Pending Payment',
      scenario: FakePaymentScenario.PENDING,
      amount: 1000,
      expectedResult: 'Payment pending'
    },
    {
      name: 'Invalid Signature',
      scenario: FakePaymentScenario.INVALID_SIGNATURE,
      amount: 1000,
      expectedResult: 'Invalid signature'
    },
    {
      name: 'Invalid Amount',
      scenario: FakePaymentScenario.INVALID_AMOUNT,
      amount: 0,
      expectedResult: 'Invalid amount'
    },
    {
      name: 'Duplicate Transaction',
      scenario: FakePaymentScenario.DUPLICATE_TRANSACTION,
      amount: 1000,
      expectedResult: 'Duplicate transaction'
    },
    {
      name: 'Expired Transaction',
      scenario: FakePaymentScenario.EXPIRED_TRANSACTION,
      amount: 1000,
      expectedResult: 'Transaction expired'
    },
    {
      name: 'Network Error',
      scenario: FakePaymentScenario.NETWORK_ERROR,
      amount: 1000,
      expectedResult: 'Network error'
    }
  ];
};

// Utility to create fake order for testing
export const createFakeOrder = (userId: string, items: any[] = []) => {
  const orderId = new mongoose.Types.ObjectId().toString();
  const transaction_uuid = generateFakeTransactionUUID();
  
  return {
    _id: orderId,
    user: userId,
    items: items.length > 0 ? items : [
      {
        productId: new mongoose.Types.ObjectId().toString(),
        quantity: 1,
        price: 1000
      }
    ],
    totalAmount: 1000,
    status: 'pending',
    paymentStatus: 'pending',
    transactionId: transaction_uuid,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Export mongoose for type compatibility
import mongoose from 'mongoose'; 