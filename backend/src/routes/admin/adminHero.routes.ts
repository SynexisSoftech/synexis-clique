import express from 'express';
import {
  createHeroSlide,
  getAllHeroSlides,
  getHeroSlideById,
  updateHeroSlide,
  deleteHeroSlide
} from '../../controllers/admin/adminHero.controller'; // Adjust path as needed
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path to your new middleware
import { UserRole } from '../../models/user.model'; // Adjust path to your user model

const router = express.Router();

// All routes here are prefixed with /api/admin/hero-slides and are protected.
// The `protect` middleware verifies the JWT and populates req.user.
// The `authorize` middleware checks if the user's role matches the allowed roles.

router.route('/')
  .post(protect, authorize([UserRole.ADMIN]), createHeroSlide)
  .get(protect, authorize([UserRole.ADMIN]), getAllHeroSlides);

router.route('/:id')
  .get(protect, authorize([UserRole.ADMIN]), getHeroSlideById)
  .put(protect, authorize([UserRole.ADMIN]), updateHeroSlide)
  .delete(protect, authorize([UserRole.ADMIN]), deleteHeroSlide);

export default router;