// controllers/user.controller.ts

import { Request, Response } from 'express';
import UserModel from '../../models/user.model';
import { AuthRequest } from '../../middleware/auth.middleware'; // Import your custom AuthRequest

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
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
};

/**
 * @desc    Block or unblock a user (admin only)
 * @route   PATCH /api/admin/users/:userId/block
 * @access  Private/Admin
 */
export const toggleUserBlockStatus = async (req: AuthRequest, res: Response): Promise<void> => {
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
};