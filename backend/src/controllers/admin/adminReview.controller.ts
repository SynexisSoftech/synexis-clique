import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Review, IReview } from '../../models/review.model'; // Adjust path
import mongoose from 'mongoose';

/**
 * @desc    Get all reviews (with pagination and filtering)
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
export const getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const statusFilter = req.query.status as string;

        const query: any = {};
        if (statusFilter && ['pending', 'active', 'hidden', 'flagged'].includes(statusFilter)) {
            query.status = statusFilter;
        }

        const count = await Review.countDocuments(query);
        const reviews = await Review.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('userId', 'username email') // Populate user info
            .populate('productId', 'name') // Populate product info
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
 * @desc    Get a single review by ID
 * @route   GET /api/admin/reviews/:id
 * @access  Private/Admin
 */
export const getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid review ID format' });
            return;
        }
        const review = await Review.findById(req.params.id)
            .populate('userId', 'username email')
            .populate('productId', 'name');

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
 * @desc    Update a review's status (approve, hide, flag)
 * @route   PUT /api/admin/reviews/:id/status
 * @access  Private/Admin
 */
export const updateReviewStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const { status } = req.body;

    if (!status || !['pending', 'active', 'hidden', 'flagged'].includes(status)) {
        res.status(400).json({ message: 'Invalid status provided.' });
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

        review.status = status;
        const updatedReview = await review.save();
        res.json(updatedReview);

    } catch (error: any) {
        console.error('[Admin Review Controller] Update Status Error:', error.message);
        res.status(500).json({ message: 'Server error while updating review status' });
    }
};


/**
 * @desc    Delete a review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
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