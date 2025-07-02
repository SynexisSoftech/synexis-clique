// controllers/user.controller.ts

import { Request, Response } from 'express';
import UserModel, { UserRole } from '../../models/user.model';
import { AuthRequest } from '../../middleware/auth.middleware'; // Import your custom AuthRequest
import { asyncHandler } from './src/utils/asyncHandler';

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all users but exclude their sensitive data
    const users = await UserModel.find({}).select('-password -passwordResetOTP -passwordResetExpires');
    res.status(200).json({
      message: 'Users retrieved successfully.',
      count: users.length,
      users,
    });
  } catch (err: any) {
    console.error('Admin Get All Users Error:', err);
    res.status(500).json({ message: `Failed to retrieve users: ${err.message}` });
  }
});

/**
 * @desc    Change a user's role (admin only)
 * @route   PATCH /api/admin/users/:userId/role
 * @access  Private/Admin
 */
export const changeUserRole = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { role } = req.body;

    // --- Input Validation ---
    // Check if the provided role is a valid role from the UserRole enum
    if (!role || !Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({ message: 'Invalid request body. "role" must be a valid user role.' });
        return;
    }

    try {
        const userToUpdate = await UserModel.findById(userId);

        if (!userToUpdate) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        // Prevent an admin from changing their own role to avoid self-lockout
        if (req.user && userToUpdate._id.equals(req.user._id)) {
            res.status(400).json({ message: 'Admins cannot change their own role.' });
            return;
        }

        // --- Update and Save ---
        userToUpdate.role = role as UserRole;
        await userToUpdate.save();

        // Exclude sensitive fields from the response
        const { password, passwordResetOTP, passwordResetExpires, ...safeUserResponse } = userToUpdate.toObject();

        res.status(200).json({
            message: `User role has been successfully updated to "${role}".`,
            user: safeUserResponse,
        });

    } catch (err: any) {
        console.error('Admin Change User Role Error:', err);
        res.status(500).json({ message: `Failed to update user role: ${err.message}` });
    }
});

/**
 * @desc    Block or unblock a user (admin only)
 * @route   PATCH /api/admin/users/:userId/block
 * @access  Private/Admin
 */
export const toggleUserBlockStatus = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { isBlocked } = req.body;

    if (typeof isBlocked !== 'boolean') {
        res.status(400).json({ message: 'Invalid request body. "isBlocked" must be a boolean.' });
        return;
    }

    try {
        const userToUpdate = await UserModel.findById(userId);

        if (!userToUpdate) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        if (req.user && userToUpdate._id.equals(req.user._id)) { // Added null check for req.user for robustness
            res.status(400).json({ message: 'Admins cannot block their own accounts.' });
            return;
        }

        userToUpdate.isBlocked = isBlocked;
        await userToUpdate.save();

        // Correctly exclude sensitive fields from the response
        const { password, passwordResetOTP, passwordResetExpires, ...safeUserResponse } = userToUpdate.toObject();

        res.status(200).json({
            message: `User has been successfully ${isBlocked ? 'blocked' : 'unblocked'}.`,
            user: safeUserResponse, // Use the object with sensitive fields excluded
        });

    } catch (err: any) {
        console.error('Admin Toggle Block Status Error:', err);
        res.status(500).json({ message: `Failed to update user status: ${err.message}` });
    }
});