// routes/admin.routes.ts

import express from 'express';
import * as UserController from '../../controllers/admin/user.controller';
import { protect, authorize } from '../../middleware/auth.middleware'; // Import both middleware functions
import { UserRole } from '../../models/user.model'; // Import the UserRole enum

const router = express.Router();

/**
 * All routes in this file are prefixed with `/api/admin` in your main app.
 *
 * Middleware Execution Order:
 * 1. `protect`: Verifies the JWT token. If valid, it attaches the user object to `req.user`.
 * 2. `authorize([UserRole.ADMIN])`: Checks if `req.user.role` is 'admin'. This must run AFTER `protect`.
 */

// GET /api/admin/users - Fetches all users in the system (Admin only)
router.get('/users', protect, authorize([UserRole.ADMIN]), UserController.getAllUsers);

// PATCH /api/admin/users/:userId/block - Blocks or unblocks a specific user (Admin only)
router.patch('/users/:userId/block', protect, authorize([UserRole.ADMIN]), UserController.toggleUserBlockStatus);

export default router;