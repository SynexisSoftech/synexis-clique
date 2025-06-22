# Debugging Stock Reduction Issue

## 🔍 **Issue**: Stock not dropping after purchase

## 🛠️ **Quick Fix Applied**

I've identified and fixed the main issue: **The frontend was using a direct `fetch` call instead of the configured `apiClient`**, which meant it wasn't using the correct backend URL.

### ✅ **Changes Made**:

1. **Fixed API Call**: Updated `orderService.verifyPayment()` to use `apiClient` instead of direct `fetch`
2. **Added Debugging**: Enhanced logging in both frontend and backend
3. **Added Status Tracking**: Added verification status indicators in the success page
4. **Better Error Handling**: Improved error messages and user feedback

## 🧪 **Testing Steps**

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```

### Step 2: Start Frontend Server
```bash
cd frontend
npm run dev
```

### Step 3: Test Complete Flow
1. Add items to cart
2. Go through checkout process
3. Complete payment with eSewa
4. Check browser console for logs
5. Check backend console for logs

### Step 4: Check Logs

**Frontend Console** (F12 → Console):
```
🔍 Starting payment verification...
📊 Payment data: { transaction_uuid: "...", ... }
🔍 OrderService: Sending payment verification request: {...}
✅ OrderService: Payment verification successful: {...}
```

**Backend Console**:
```
🔍 [Payment Verification] Endpoint called
📊 [Payment Verification] Request body: {...}
[Payment Verification] Order lookup result: Found order: ...
[Payment Verification] Starting stock reduction process...
[Payment Verification] Reduced stock for product ...: X units
✅ [Payment Verification] Successfully processed order ... and reduced stock
```

## 🔧 **Manual Testing**

### Test 1: Direct API Call
Use the test script I created:

```bash
# Update the test data with actual values from your database
node test-payment-verification.js
```

### Test 2: Database Check
Check your MongoDB directly:

```javascript
// Connect to your MongoDB and run:
db.orders.findOne({ status: "PENDING" })  // Find a pending order
db.products.findOne({ stockQuantity: { $gt: 0 } })  // Find products with stock
```

## 🚨 **Common Issues & Solutions**

### Issue 1: "Order not found"
**Cause**: `transaction_uuid` mismatch
**Solution**: Check that the order was created with the correct `transaction_uuid`

### Issue 2: "Payment not complete"
**Cause**: Status is not "COMPLETE"
**Solution**: Verify eSewa is sending the correct status

### Issue 3: "Insufficient stock"
**Cause**: Stock validation during order creation
**Solution**: Check product stock quantities in database

### Issue 4: "Network error"
**Cause**: Backend not running or wrong URL
**Solution**: Ensure backend is running on port 3001

## 📊 **Verification Checklist**

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Database connection working
- [ ] Order created with PENDING status
- [ ] Payment completed with eSewa
- [ ] Success page loads with payment data
- [ ] Backend verification endpoint called
- [ ] Order status updated to COMPLETED
- [ ] Product stock quantities reduced
- [ ] No errors in console logs

## 🔍 **Debug Commands**

### Check Backend Logs
```bash
cd backend
npm run dev
# Watch for payment verification logs
```

### Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Complete a purchase
4. Look for `/api/orders/verify-payment` request
5. Check request/response details

### Check Database
```bash
# Connect to MongoDB and check:
db.orders.find({}).sort({createdAt: -1}).limit(5)  # Recent orders
db.products.find({}).sort({updatedAt: -1}).limit(5)  # Recent product updates
```

## 📞 **If Still Not Working**

1. **Check the logs** - Look for specific error messages
2. **Verify database** - Ensure orders and products exist
3. **Test manually** - Use the test script with real data
4. **Check network** - Ensure frontend can reach backend
5. **Verify eSewa** - Ensure payment data is correct

## 🎯 **Expected Behavior**

After a successful purchase:
1. Order status changes from `PENDING` to `COMPLETED`
2. Product `stockQuantity` decreases by ordered amount
3. Product status changes to `out-of-stock` if stock reaches 0
4. Success page shows "Inventory updated successfully"

Let me know what you see in the logs and I can help further debug! 