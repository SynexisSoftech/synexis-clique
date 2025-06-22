# Stock Reduction System Implementation

## Overview

This implementation automatically reduces product stock quantities when a user successfully completes a checkout and payment is confirmed. The system ensures data consistency and prevents overselling.

## Key Features

✅ **Automatic Stock Reduction**: Stock is reduced only after successful payment confirmation  
✅ **Data Consistency**: Uses database transactions to ensure atomic operations  
✅ **Stock Validation**: Prevents orders with insufficient stock  
✅ **Status Management**: Updates order status to 'COMPLETED' after payment  
✅ **Error Handling**: Comprehensive error handling and rollback mechanisms  
✅ **Security**: Signature verification for payment authenticity  

## Implementation Details

### 1. Backend Payment Verification Endpoint

**File**: `backend/src/controllers/public/order.controller.ts`

**Endpoint**: `POST /api/orders/verify-payment`

**Function**: `verifyPayment()`

**Key Features**:
- Verifies payment status from eSewa
- Updates order status to 'COMPLETED'
- Reduces stock quantities for all ordered products
- Uses database transactions for data consistency
- Handles insufficient stock scenarios
- Updates product status to 'out-of-stock' when stock reaches 0

### 2. Stock Validation During Order Creation

**File**: `backend/src/controllers/public/order.controller.ts`

**Function**: `createOrder()`

**Key Features**:
- Validates stock availability before creating order
- Prevents orders with insufficient stock
- Returns clear error messages for stock issues

### 3. Frontend Payment Verification

**File**: `frontend/app/(root)/success/page.tsx`

**Key Features**:
- Calls backend verification endpoint on successful payment
- Handles verification errors gracefully
- Maintains user experience even if verification fails

### 4. Service Layer

**File**: `frontend/service/public/orderService.ts`

**Function**: `verifyPayment()`

**Key Features**:
- Encapsulates payment verification logic
- Provides type-safe interfaces
- Handles API communication

## Database Schema

### Product Model
```typescript
stockQuantity: {
  type: Number,
  required: [true, 'Stock quantity is required.'],
  min: [0, 'Stock quantity cannot be negative.'],
  default: 0,
}
```

### Order Model
```typescript
status: {
  type: String,
  enum: ['PENDING', 'COMPLETED', 'FAILED'],
  default: 'PENDING',
},
eSewaRefId: {
  type: String,
},
```

## API Endpoints

### Payment Verification
```
POST /api/orders/verify-payment
Content-Type: application/json

{
  "transaction_uuid": "string",
  "transaction_code": "string", 
  "status": "COMPLETE",
  "total_amount": "string",
  "signature": "string"
}
```

**Response**:
```json
{
  "message": "Payment verified and stock updated successfully",
  "orderId": "string",
  "status": "COMPLETED"
}
```

## Flow Diagram

```
1. User places order → Order created with PENDING status
2. User redirected to eSewa → Payment processing
3. eSewa redirects to success page → Payment data received
4. Success page calls verify-payment endpoint → Backend verification
5. Backend verifies payment → Updates order status to COMPLETED
6. Backend reduces stock quantities → Database transaction
7. Stock updated in database → Success response
```

## Error Handling

### Insufficient Stock
- Prevents order creation if stock is insufficient
- Returns clear error message with available vs requested quantities

### Payment Verification Failures
- Logs errors but doesn't affect user experience
- Maintains order integrity

### Database Transaction Failures
- Automatic rollback on any error
- Ensures data consistency

## Security Features

### Signature Verification
- Verifies eSewa payment signature
- Prevents unauthorized payment confirmations
- Uses HMAC-SHA256 for signature validation

### Transaction Safety
- Database transactions ensure atomic operations
- Rollback on any failure prevents partial updates

## Testing

### Test Script
**File**: `backend/test-stock-reduction.js`

**Usage**:
```bash
cd backend
node test-stock-reduction.js
```

**What it tests**:
- Stock reduction functionality
- Database transaction integrity
- Error handling scenarios
- Order status updates

## Configuration

### Environment Variables
- `MONGODB_URI`: Database connection string
- eSewa configuration (already configured)

### Constants
- Secret key for signature verification
- Product code for eSewa integration

## Monitoring and Logging

### Backend Logs
- Payment verification attempts
- Stock reduction operations
- Error scenarios
- Transaction success/failure

### Frontend Logs
- Payment verification API calls
- Error handling for verification failures

## Future Enhancements

1. **Webhook Support**: Direct eSewa webhook integration
2. **Email Notifications**: Stock alerts for low inventory
3. **Admin Dashboard**: Stock movement tracking
4. **Analytics**: Stock consumption reports
5. **Auto-reorder**: Automatic reorder when stock is low

## Troubleshooting

### Common Issues

1. **Stock not reducing**: Check payment verification logs
2. **Order status not updating**: Verify transaction_uuid matching
3. **Database errors**: Check MongoDB connection and transaction logs
4. **Signature verification failures**: Verify eSewa configuration

### Debug Steps

1. Check backend logs for payment verification
2. Verify order status in database
3. Check product stock quantities
4. Validate eSewa payment data
5. Test with the provided test script

## Performance Considerations

- Database transactions ensure data consistency
- Minimal API calls during checkout process
- Efficient stock validation during order creation
- Proper indexing on transaction_uuid for fast lookups

## Compliance

- Follows eSewa integration guidelines
- Maintains audit trail of stock changes
- Secure payment verification process
- Data integrity through transactions 