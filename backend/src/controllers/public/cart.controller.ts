import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Cart } from '../../models/cart.model'; // Adjust path
import { Product } from '../../models/product.model'; // Adjust path
import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Get the logged-in user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getMyCart = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
});

/**
 * @desc    Add or update an item in the cart
 * @route   POST /api/cart/items
 * @access  Private
 */
export const addItemToCart = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { productId, quantity } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized, user not found' });
            return;
        }

        // Enhanced validation
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'Invalid product ID format' });
            return;
        }

        if (!quantity || quantity < 1) {
            res.status(400).json({ message: 'Quantity must be at least 1' });
            return;
        }

        // Add maximum quantity limit to prevent abuse
        if (quantity > 50) {
            res.status(400).json({ message: 'Maximum quantity allowed is 50' });
            return;
        }

        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Check if product is active/available
        if (product.status !== 'active') {
            res.status(400).json({ message: 'Product is not available for purchase' });
            return;
        }

        // Enhanced stock validation
        if (product.stockQuantity < quantity) {
            res.status(400).json({ 
                message: `Only ${product.stockQuantity} items available in stock`,
                availableStock: product.stockQuantity,
                requestedQuantity: quantity
            });
            return;
        }

        let cart = await Cart.findOne({ userId: req.user._id });

        // If no cart, create one
        if (!cart) {
            cart = new Cart({ userId: req.user._id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        const itemPrice = product.discountPrice ?? product.originalPrice;

        let action = 'added';
        let previousQuantity = 0;

        if (itemIndex > -1) {
            // Update quantity if item exists
            previousQuantity = cart.items[itemIndex].quantity;
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].price = itemPrice; // Update price in case it changed
            action = 'updated';
        } else {
            // Add new item if it doesn't exist
            cart.items.push({ productId, quantity, price: itemPrice });
        }

        const updatedCart = await cart.save();
        await updatedCart.populate({
            path: 'items.productId',
            select: 'title images originalPrice discountPrice stockQuantity status',
        });

        // Enhanced response with more details
        res.status(200).json({
            cart: updatedCart,
            message: `Item ${action} to cart successfully`,
            action,
            previousQuantity,
            newQuantity: quantity,
            productName: product.title
        });
    } catch (error: any) {
        console.error('[Cart Controller] Add Item Error:', error.message);
        res.status(500).json({ message: 'Server error while adding item to cart' });
    }
});

/**
 * @desc    Remove an item from the cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private
 */
export const removeItemFromCart = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
});

/**
 * @desc    Clear all items from the cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
});

/**
 * @desc    Validate cart items (check stock and availability)
 * @route   POST /api/cart/validate
 * @access  Private
 */
export const validateCart = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized, user not found' });
            return;
        }

        const cart = await Cart.findOne({ userId: req.user._id }).populate({
            path: 'items.productId',
            select: 'title images originalPrice discountPrice stockQuantity status',
        });

        if (!cart || cart.items.length === 0) {
            res.status(200).json({
                isValid: false,
                message: 'Cart is empty',
                issues: []
            });
            return;
        }

        const issues: Array<{
            productId: string;
            productName: string;
            type: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRODUCT_UNAVAILABLE' | 'PRICE_CHANGED';
            message: string;
            currentQuantity: number;
            availableStock?: number;
            oldPrice?: number;
            newPrice?: number;
        }> = [];

        for (const item of cart.items) {
            const product = item.productId as any; // Type assertion for populated product
            
            // Check if product exists and is active
            if (!product || product.status !== 'active') {
                issues.push({
                    productId: item.productId.toString(),
                    productName: product?.title || 'Unknown Product',
                    type: 'PRODUCT_UNAVAILABLE',
                    message: 'Product is no longer available',
                    currentQuantity: item.quantity
                });
                continue;
            }

            // Check stock availability
            if (product.stockQuantity === 0) {
                issues.push({
                    productId: item.productId.toString(),
                    productName: product.title,
                    type: 'OUT_OF_STOCK',
                    message: 'Product is out of stock',
                    currentQuantity: item.quantity
                });
            } else if (product.stockQuantity < item.quantity) {
                issues.push({
                    productId: item.productId.toString(),
                    productName: product.title,
                    type: 'INSUFFICIENT_STOCK',
                    message: `Only ${product.stockQuantity} items available`,
                    currentQuantity: item.quantity,
                    availableStock: product.stockQuantity
                });
            }

            // Check if price has changed
            const currentPrice = product.discountPrice ?? product.originalPrice;
            if (currentPrice !== item.price) {
                issues.push({
                    productId: item.productId.toString(),
                    productName: product.title,
                    type: 'PRICE_CHANGED',
                    message: 'Product price has changed',
                    currentQuantity: item.quantity,
                    oldPrice: item.price,
                    newPrice: currentPrice
                });
            }
        }

        const isValid = issues.length === 0;

        res.status(200).json({
            isValid,
            message: isValid ? 'Cart is valid' : 'Cart has issues',
            issues,
            cart: cart
        });

    } catch (error: any) {
        console.error('[Cart Controller] Validate Cart Error:', error.message);
        res.status(500).json({ message: 'Server error while validating cart' });
    }
});