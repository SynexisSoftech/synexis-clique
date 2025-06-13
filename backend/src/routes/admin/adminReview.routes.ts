import express from 'express';
import {
    getAllReviews,
    getReviewById,
    updateReviewStatus,
    deleteReview
} from '../../controllers/admin/adminReview.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../models/user.model';

const router = express.Router();

// All routes are protected for Admins
router.route('/')
    .get(protect, authorize([UserRole.ADMIN]), getAllReviews);

router.route('/:id')
    .get(protect, authorize([UserRole.ADMIN]), getReviewById)
    .delete(protect, authorize([UserRole.ADMIN]), deleteReview);

router.route('/:id/status')
    .put(protect, authorize([UserRole.ADMIN]), updateReviewStatus);

export default router;