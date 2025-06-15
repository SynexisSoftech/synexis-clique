import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Cart } from '../../models/cart.model'; // Adjust path
import mongoose from 'mongoose';

/**
 * @desc    Get all user carts (paginated)
 * @route   GET /api/admin/carts
 * @access  Private/Admin
 */
export const getAllCarts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;

        const count = await Cart.countDocuments();
        const carts = await Cart.find()
            .populate('userId', 'username email')
            .populate({
                path: 'items.productId',
                select: 'title originalPrice',
            })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ updatedAt: -1 });

        res.json({
            carts,
            page,
            pages: Math.ceil(count / pageSize),
            count,
        });
    } catch (error: any) {
        console.error('[Admin Cart Controller] Get All Carts Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching carts' });
    }
};

/**
 * @desc    Get a single cart by its ID
 * @route   GET /api/admin/carts/:id
 * @access  Private/Admin
 */
export const getCartById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid cart ID format' });
            return;
        }

        const cart = await Cart.findById(req.params.id)
            .populate('userId', 'username email photoURL')
            .populate({
                path: 'items.productId',
                select: 'title images originalPrice discountPrice stockQuantity',
            });

        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        res.json(cart);
    } catch (error: any) {
        console.error('[Admin Cart Controller] Get Cart By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching cart' });
    }
};