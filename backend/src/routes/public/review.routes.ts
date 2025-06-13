import express from 'express';
import {
    createReview,
    getProductReviews
} from '../../controllers/public/review.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

// Nested under products
router.route('/:productId/reviews')
    .post(protect, createReview) // Only authenticated users can create a review
    .get(getProductReviews);     // Anyone can view active reviews for a product

export default router;