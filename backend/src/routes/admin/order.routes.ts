import express from 'express';
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderDeliveryStatus
} from '../../controllers/admin/order.controller'; // Adjust path as needed
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path
import { UserRole } from '../../models/user.model'; // Adjust path

const router = express.Router();

// All routes are prefixed with /api/admin/orders
// They require the user to be an authenticated Admin.

router.route('/')
  .get(protect, authorize([UserRole.ADMIN]), getAllOrders);

router.route('/:id')
  .get(protect, authorize([UserRole.ADMIN]), getOrderById);

router.route('/:id/status')
  .put(protect, authorize([UserRole.ADMIN]), updateOrderStatus);

router.route('/:id/delivery-status')
  .put(protect, authorize([UserRole.ADMIN]), updateOrderDeliveryStatus);

export default router;