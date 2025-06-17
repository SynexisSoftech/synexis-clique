import { Request, Response, NextFunction } from 'express';
import { SocialLink } from '../../models/socialLink.model'; // Adjust path as needed
/**
 * @desc    Get all active social links for public view
 * @route   GET /api/social-links
 * @access  Public
 */
export const getPublicSocialLinks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Find all social links where the status is 'active'.
        // This ensures that inactive or draft links are not shown to the public.
        const activeSocialLinks = await SocialLink.find({ status: 'active' })
            .select('title link description icon') // Select only the fields needed for the public
            .sort({ createdAt: 'asc' }); // Sort them, e.g., by creation date

        // If you want to implement a specific order, you might add an 'order' field to your model
        // and sort by that instead, e.g., .sort({ order: 'asc' })

        res.status(200).json({
            success: true,
            count: activeSocialLinks.length,
            data: activeSocialLinks,
        });

    } catch (error: any) {
        console.error('[Public SocialLink Controller] Get All Error:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching social links' 
        });
    }
};
/**
 * @desc    Get a single public social link by ID
 * @route   GET /api/social-links/:id
 * @access  Public
 */
export const getPublicSocialLinkById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || id.length < 10) {
            res.status(400).json({ message: 'Invalid ID' });
            return;
        }

        const link = await SocialLink.findOne({ _id: id, status: 'active' });

        if (!link) {
            res.status(404).json({ message: 'Social link not found' });
            return;
        }

        res.status(200).json(link);
    } catch (error: any) {
        console.error('[Public SocialLink Controller] Fetch By ID Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch social link' });
    }
};
