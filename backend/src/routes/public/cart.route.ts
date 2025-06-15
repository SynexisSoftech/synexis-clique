import express from 'express';
import { protect } from '../../middleware/auth.middleware'; // Adjust path
import {
    getMyCart,
    addItemToCart,
    removeItemFromCart,
    clearCart,
} from '../../controllers/public/cart.controller'; // Adjust path

const router = express.Router();

// All routes are prefixed with /api/cart
// They require the user to be authenticated

router.route('/')
    .get(protect, getMyCart)
    .delete(protect, clearCart);

router.route('/items')
    .post(protect, addItemToCart);

router.route('/items/:productId')
    .delete(protect, removeItemFromCart);

export default router;