import express from 'express';
import {
  getMyOrders,
  getMyOrderById,
  createOrder,
  verifyPayment,
  verifyPaymentStatus,
} from '../../controllers/public/order.controller';
import { protect } from '../../middleware/auth.middleware';
import { 
  createOrderRules, 
  paymentVerificationRules, 
  validate 
} from '../../middleware/validate';
import { 
  orderCreationLimiter, 
  paymentVerificationLimiter 
} from '../../middleware/rateLimiter';
import { eSewaWebhookMiddleware } from '../../middleware/esewaWebhook.middleware';

const router = express.Router();

// All routes are prefixed with /api/orders
// They require the user to be authenticated, but do not require a specific role.

// Order creation - requires authentication, validation, and rate limiting
router.route('/')
  .post(
    protect, 
    orderCreationLimiter,
    createOrderRules(),
    validate,
    createOrder
  );

// Payment verification - public endpoint with eSewa webhook security, rate limiting and validation
router.route('/verify-payment')
  .post(
    ...eSewaWebhookMiddleware,
    paymentVerificationLimiter,
    paymentVerificationRules(),
    validate,
    verifyPayment
  );

// Alternative payment status verification - based on eSewa token integration
router.route('/verify-payment-status')
  .post(
    ...eSewaWebhookMiddleware,
    paymentVerificationLimiter,
    paymentVerificationRules(),
    validate,
    verifyPaymentStatus
  );

// Get user's orders - requires authentication
router.route('/my-orders')
  .get(protect, getMyOrders);

// Get specific order - requires authentication and ownership verification
router.route('/:id')
  .get(protect, getMyOrderById);

export default router;
