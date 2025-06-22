import express from 'express';
import {
  getMyOrders,
  getMyOrderById,
  createOrder, // <-- New import
  verifyPayment, // <-- New import
} from '../../controllers/public/order.controller'; // Adjust path
import { protect } from '../../middleware/auth.middleware'; // Adjust path

const router = express.Router();

// All routes are prefixed with /api/orders
// They require the user to be authenticated, but do not require a specific role.

router.route('/')
  .post(protect, createOrder); // <-- New route to create an order

router.route('/verify-payment')
  .post(verifyPayment); // <-- New route for payment verification (no auth required - webhook)

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(protect, getMyOrderById);

export default router;
