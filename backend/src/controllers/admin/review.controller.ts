import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Review, IReview } from '../../models/review.model'; // Adjust path
import mongoose from 'mongoose';

/**
 * @desc    Get all reviews (admin view)
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
export const getAllReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const { productId, userId, status: statusFilter, rating } = req.query;

        const query: any = {};
        if (productId && mongoose.Types.ObjectId.isValid(productId as string)) {
            query.productId = productId;
        }
        if (userId && mongoose.Types.ObjectId.isValid(userId as string)) {
            query.userId = userId;
        }
        if (statusFilter && ['active', 'hidden', 'flagged'].includes(statusFilter as string)) {
            query.status = statusFilter;
        }
        if (rating && !isNaN(Number(rating))) {
            query.rating = Number(rating);
        }

        const count = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .populate('productId', 'title')
            .populate('userId', 'username email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({
            reviews,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Admin Review Controller] Get All Reviews Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching reviews' });
    }
};

/**
 * @desc    Get review by ID (admin view)
 * @route   GET /api/admin/reviews/:id
 * @access  Private/Admin
 */
export const getReviewById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid review ID format' });
            return;
        }
        const review = await Review.findById(req.params.id)
            .populate('productId', 'title')
            .populate('userId', 'username email');

        if (review) {
            res.json(review);
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error: any) {
        console.error('[Admin Review Controller] Get Review By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching review' });
    }
};

/**
 * @desc    Update review status (admin)
 * @route   PUT /api/admin/reviews/:id/status
 * @access  Private/Admin
 */
export const updateReviewStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.body;
    const validStatuses = ['active', 'hidden', 'flagged'];

    if (!status || !validStatuses.includes(status)) {
        res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        return;
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid review ID format' });
            return;
        }
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        review.status = status as IReview['status'];
        const updatedReview = await review.save();
        res.json(updatedReview);
    } catch (error: any) {
        console.error('[Admin Review Controller] Update Review Status Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating review status' });
        }
    }
};

/**
 * @desc    Delete a review (admin)
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid review ID format' });
            return;
        }
        const review = await Review.findById(req.params.id);

        if (!review) {
            res.status(404).json({ message: 'Review not found' });
            return;
        }

        await review.deleteOne();
        res.json({ message: 'Review removed successfully' });
    } catch (error: any) {
        console.error('[Admin Review Controller] Delete Review Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting review' });
    }
};