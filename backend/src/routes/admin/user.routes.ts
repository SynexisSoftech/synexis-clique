import express from 'express';
import * as UserController from '../../controllers/admin/user.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../models/user.model';

const router = express.Router();

/**
 * All routes are protected and restricted to Admins.
 * Middleware Execution Order:
 * 1. `protect`: Verifies JWT and attaches user to `req.user`.
 * 2. `authorize([UserRole.ADMIN])`: Checks if `req.user.role` is 'admin'.
 */

// GET /api/admin/users - Fetches all users
router.get('/users', protect, authorize([UserRole.ADMIN]), UserController.getAllUsers);

// PATCH /api/admin/users/:userId/block - Blocks or unblocks a user
router.patch('/users/:userId/block', protect, authorize([UserRole.ADMIN]), UserController.toggleUserBlockStatus);

// PATCH /api/admin/users/:userId/role - Changes a user's role <-- ADD THIS LINE
router.patch('/users/:userId/role', protect, authorize([UserRole.ADMIN]), UserController.changeUserRole);

export default router;