import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderDeliveryStatus,
  getOrdersByProductId
} from '../../controllers/admin/order.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../models/user.model';
import { 
  updateOrderStatusRules, 
  updateOrderDeliveryStatusRules, 
  validate 
} from '../../middleware/validate';
import { 
  adminActionLimiter, 
  orderStatusUpdateLimiter 
} from '../../middleware/rateLimiter';

const router = express.Router();

// All routes are prefixed with /api/admin/orders
// They require the user to be an authenticated Admin.

// Get all orders - requires admin authentication and rate limiting
router.route('/')
  .get(
    protect, 
    authorize([UserRole.ADMIN]), 
    adminActionLimiter,
    getAllOrders
  );

// Get specific order - requires admin authentication
router.route('/:id')
  .get(
    protect, 
    authorize([UserRole.ADMIN]), 
    adminActionLimiter,
    getOrderById
  );

// Update order status - requires admin authentication, validation, and rate limiting
router.route('/:id/status')
  .put(
    protect, 
    authorize([UserRole.ADMIN]), 
    orderStatusUpdateLimiter,
    updateOrderStatusRules(),
    validate,
    updateOrderStatus
  );

// Update order delivery status - requires admin authentication, validation, and rate limiting
router.route('/:id/delivery-status')
  .put(
    protect, 
    authorize([UserRole.ADMIN]), 
    orderStatusUpdateLimiter,
    updateOrderDeliveryStatusRules(),
    validate,
    updateOrderDeliveryStatus
  );

// Get orders by product ID - requires admin authentication
router.route('/products/:productId/orders')
  .get(
    protect, 
    authorize([UserRole.ADMIN]), 
    adminActionLimiter,
    getOrdersByProductId
  );

export default router;