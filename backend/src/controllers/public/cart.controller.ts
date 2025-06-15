import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Cart } from '../../models/cart.model'; // Adjust path
import { Product } from '../../models/product.model'; // Adjust path
import mongoose from 'mongoose';

/**
 * @desc    Get the logged-in user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getMyCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized, user not found' });
            return;
        }

        const cart = await Cart.findOne({ userId: req.user._id }).populate({
            path: 'items.productId',
            select: 'title images originalPrice discountPrice stockQuantity',
        });

        if (!cart) {
            // If a user has no cart yet, return a new empty cart structure
            res.json({
                userId: req.user._id,
                items: [],
            });
            return;
        }

        res.json(cart);
    } catch (error: any) {
        console.error('[Cart Controller] Get My Cart Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching cart' });
    }
};

/**
 * @desc    Add or update an item in the cart
 * @route   POST /api/cart/items
 * @access  Private
 */
export const addItemToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId, quantity } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized, user not found' });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(productId) || !quantity || quantity < 1) {
            res.status(400).json({ message: 'Invalid product ID or quantity provided' });
            return;
        }

        const product = await Product.findById(productId);
        if (!product || product.stockQuantity < quantity) {
            res.status(404).json({ message: 'Product not found or insufficient stock' });
            return;
        }

        let cart = await Cart.findOne({ userId: req.user._id });

        // If no cart, create one
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        const itemPrice = product.discountPrice ?? product.originalPrice;

        if (itemIndex > -1) {
            // Update quantity if item exists
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Add new item if it doesn't exist
            cart.items.push({ productId, quantity, price: itemPrice });
        }

        const updatedCart = await cart.save();
        await updatedCart.populate({
            path: 'items.productId',
            select: 'title images originalPrice discountPrice stockQuantity',
        });


        res.status(200).json(updatedCart);
    } catch (error: any) {
        console.error('[Cart Controller] Add Item Error:', error.message);
        res.status(500).json({ message: 'Server error while adding item to cart' });
    }
};

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
export const removeItemFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId } = req.params;

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized, user not found' });
            return;
        }
         if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'Invalid product ID format' });
            return;
        }

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        // Pull the item from the items array
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        const updatedCart = await cart.save();
        await updatedCart.populate({
            path: 'items.productId',
            select: 'title images originalPrice discountPrice stockQuantity',
        });


        res.json(updatedCart);
    } catch (error: any) {
        console.error('[Cart Controller] Remove Item Error:', error.message);
        res.status(500).json({ message: 'Server error while removing item from cart' });
    }
};

/**
 * @desc    Clear all items from the cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized, user not found' });
            return;
        }

        const cart = await Cart.findOne({ userId: req.user._id });
        if (!cart) {
            res.status(404).json({ message: 'Cart not found' });
            return;
        }

        cart.items = [];
        await cart.save();

        res.json({ message: 'Cart cleared successfully' });
    } catch (error: any) {
        console.error('[Cart Controller] Clear Cart Error:', error.message);
        res.status(500).json({ message: 'Server error while clearing cart' });
    }
};