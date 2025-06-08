import express from 'express';
import { getActiveHeroSlides } from '../../controllers/public/hero.controller'; // Adjust path

const router = express.Router();

// Route is prefixed with /api/hero-slides
router.get('/', getActiveHeroSlides);

export default router;