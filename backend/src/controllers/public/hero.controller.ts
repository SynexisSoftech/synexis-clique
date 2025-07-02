import { Request, Response } from 'express';
import { HeroSlide } from '../../models/heroSlide.model'; // Adjust path
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Get all active hero slides
 * @route   GET /api/hero-slides
 * @access  Public
 */
export const getActiveHeroSlides = async (req: Request, res: Response): Promise<void> => {
    try {
        const slides = await HeroSlide.find({ status: 'active' })
            .sort({ order: 1 }) // Sort by the 'order' field ascending
            .select('title subtitle imageUrl ctaText ctaLink'); // Select only the fields needed by the frontend

        res.json(slides);
    } catch (error: any) {
        console.error('[Public Hero Controller] Get Active Slides Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching hero content' });
    }
};