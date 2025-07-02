import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Review } from '../../models/review.model'; // Adjust path
import { Product } from '../../models/product.model'; // Adjust path
import mongoose from 'mongoose';
import { Order } from '../../models/order.model';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Create a new review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private
 */
export const createReview = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    // A. Check if user is logged in
    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, you must be logged in to leave a review.' });
        return;
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'Invalid Product ID format' });
            return;
        }
        
        // B. Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // 👈 **2. Check if the user has purchased the product**
        // We look for a completed order from this user that contains the product.
        const hasPurchased = await Order.findOne({
            userId: req.user._id,
            'items.productId': new mongoose.Types.ObjectId(productId),
            status: 'COMPLETED'
        });

        if (!hasPurchased) {
            res.status(403).json({ message: 'You can only review products that you have purchased.' });
            return;
        }
        
        // C. Check if the user has already submitted a review for this product
        const existingReview = await Review.findOne({ productId, userId: req.user._id });
        if (existingReview) {
            res.status(400).json({ message: 'You have already reviewed this product.' });
            return;
        }

        // D. Create and save the new review
        const review = new Review({
            productId,
            userId: req.user._id,
            rating,
            comment,
            // 👈 **3. Automatically set isVerifiedPurchase to true**
            isVerifiedPurchase: true,
            status: 'pending', // Default to pending for admin approval
        });

        const createdReview = await review.save();
        
        // (Optional but recommended): After saving the review, you might want to
        // update the average rating on the Product model itself.

        res.status(201).json(createdReview);

    } catch (error: any) {
        console.error('[Review Controller] Create Review Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while creating review.' });
        }
    }
});

/**
 * @desc    Get all active reviews for a specific product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
export const getProductReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageSize = Number(req.query.limit) || 5;
    const page = Number(req.query.page) || 1;

    if (!mongoose.Types.ObjectId.isValid(req.params.productId)) {
        res.status(400).json({ message: 'Invalid Product ID format' });
        return;
    }

    const query = {
        productId: req.params.productId,
        status: 'active' // Only show 'active' reviews to the public
    };

    const count = await Review.countDocuments(query);
    const reviews = await Review.find(query)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .populate('userId', 'username') // Only show username for privacy
        .sort({ createdAt: -1 });

    res.json({
        reviews,
        page,
        pages: Math.ceil(count / pageSize),
        count
    });
});