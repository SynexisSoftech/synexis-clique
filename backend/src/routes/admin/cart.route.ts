import express from 'express';
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path
import { UserRole } from '../../models/user.model'; // Adjust path
import {
    getAllCarts,
    getCartById,
} from '../../controllers/admin/cart.controller'; // Adjust path

const router = express.Router();

// All routes are prefixed with /api/admin/carts
// They require the user to be an authenticated Admin

router.route('/')
    .get(protect, authorize([UserRole.ADMIN]), getAllCarts);

router.route('/:id')
    .get(protect, authorize([UserRole.ADMIN]), getCartById);

export default router;