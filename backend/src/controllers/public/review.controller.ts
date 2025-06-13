import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Review } from '../../models/review.model'; // Adjust path
import { Product } from '../../models/product.model'; // Adjust path
import mongoose from 'mongoose';

/**
 * @desc    Create a new review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private
 */
export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'Invalid Product ID format' });
            return;
        }
        
        // 1. Check if the product exists
        const product = await Product.findById(productId);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        
        // 2. Check if the user has already reviewed this product
        const existingReview = await Review.findOne({ productId, userId: req.user._id });
        if (existingReview) {
            res.status(400).json({ message: 'You have already reviewed this product.' });
            return;
        }

        // 3. (Optional) Check if user has purchased this product to set isVerifiedPurchase
        // This requires custom logic to check against an Order model.
        // const isVerified = await checkIfUserPurchased(req.user._id, productId);

        const review = new Review({
            productId,
            userId: req.user._id,
            rating,
            comment,
            isVerifiedPurchase: false, // Defaulting to false, implement your own logic
            status: 'pending', // Default new reviews to 'pending' for admin approval
        });

        const createdReview = await review.save();
        res.status(201).json(createdReview);
    } catch (error: any) {
        console.error('[Review Controller] Create Review Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while creating review.' });
        }
    }
};

/**
 * @desc    Get all active reviews for a specific product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
    try {
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
    } catch (error: any) {
        console.error('[Review Controller] Get Product Reviews Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching product reviews' });
    }
};