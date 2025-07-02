import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { SocialLink, ISocialLink } from '../../models/socialLink.model'; // Adjust path
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from '../../services/cloudinary.service'; // Adjust path
import { asyncHandler } from '../../utils/asyncHandler';

// You might need a helper to extract the public ID from a Cloudinary URL to delete it
// This is a basic example; you might need a more robust implementation.
const extractPublicIdFromUrl = (url: string): string => {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    return publicIdWithExtension.split('.')[0];
};


/**
 * @desc    Create a new social link
 * @route   POST /api/admin/social-links
 * @access  Private/Admin
 */
export const createSocialLink = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let { title, link, description, icon, status } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const linkExists = await SocialLink.findOne({ title });
        if (linkExists) {
            res.status(400).json({ message: 'A social link with this title already exists' });
            return;
        }

        let iconUrl = '';
        if (icon && typeof icon === 'string' && !icon.startsWith('http')) {
            try {
                // Upload base64 encoded string to Cloudinary
                iconUrl = await uploadImageToCloudinary(icon, 'social_link_icons');
            } catch (uploadError: any) {
                console.error('[Admin SocialLink Controller] Cloudinary Upload Error:', uploadError.message);
                res.status(500).json({ message: 'Icon upload failed. Please try again.' });
                return;
            }
        } else {
            res.status(400).json({ message: 'An icon image is required for creation.' });
            return;
        }

        const socialLink = new SocialLink({
            title,
            link,
            description,
            icon: iconUrl,
            status: status || 'active',
            createdBy: req.user._id,
        });

        const createdSocialLink = await socialLink.save();
        res.status(201).json(createdSocialLink);
    } catch (error: any) {
        console.error('[Admin SocialLink Controller] Create Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while creating social link' });
        }
    }
};

/**
 * @desc    Get all social links
 * @route   GET /api/admin/social-links
 * @access  Private/Admin
 */
export const getAllSocialLinks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Typically few social links, so pagination is often not needed.
        // You can add it back if you expect a large number.
        const socialLinks = await SocialLink.find({})
            .populate('createdBy', 'username email')
            .sort({ createdAt: 'asc' });

        res.json({ socialLinks });
    } catch (error: any) {
        console.error('[Admin SocialLink Controller] Get All Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching social links' });
    }
};
/**
 * @desc    Update a social link
 * @route   PUT /api/admin/social-links/:id
 * @access  Private/Admin
 */
export const updateSocialLink = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, link, description, icon, status } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid social link ID format' });
            return;
        }

        const socialLink = await SocialLink.findById(req.params.id);

        if (!socialLink) {
            res.status(404).json({ message: 'Social link not found' });
            return;
        }

        // Check for title conflict if it's being changed
        if (title && title !== socialLink.title) {
            const existingLinkWithNewTitle = await SocialLink.findOne({ title });
            
            // --- FIX IS HERE ---
            // Use the .equals() method for safe ObjectId comparison.
            // This now works without error because we updated the ISocialLink interface.
            if (existingLinkWithNewTitle && !existingLinkWithNewTitle._id.equals(socialLink._id)) {
                res.status(400).json({ message: 'Another social link with this title already exists' });
                return;
            }
        }
        
        let newIconUrl = socialLink.icon;
        if (icon && typeof icon === 'string' && !icon.startsWith('http')) {
            try {
                newIconUrl = await uploadImageToCloudinary(icon, 'social_link_icons');
            } catch (uploadError: any) {
                console.error('[Admin SocialLink Controller] Update Upload Error:', uploadError.message);
                res.status(500).json({ message: 'Icon upload failed during update.' });
                return;
            }
        }

        socialLink.title = title || socialLink.title;
        socialLink.link = link || socialLink.link;
        socialLink.description = description !== undefined ? description : socialLink.description;
        socialLink.status = status || socialLink.status;
        socialLink.icon = newIconUrl;

        const updatedSocialLink = await socialLink.save();
        res.json(updatedSocialLink);
    } catch (error: any) {
        console.error('[Admin SocialLink Controller] Update Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating social link' });
        }
    }
};
/**
 * @desc    Delete a social link
 * @route   DELETE /api/admin/social-links/:id
 * @access  Private/Admin
 */
export const deleteSocialLink = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid social link ID format' });
            return;
        }

        const socialLink = await SocialLink.findById(req.params.id);

        if (!socialLink) {
            res.status(404).json({ message: 'Social link not found' });
            return;
        }
        
        // Optional but recommended: Delete the icon from Cloudinary before deleting the DB record.
        // if (socialLink.icon) {
        //     try {
        //         const publicId = extractPublicIdFromUrl(socialLink.icon);
        //         await deleteImageFromCloudinary(publicId); // Assumes you have this service function
        //     } catch (e) {
        //         console.error('Failed to delete icon from Cloudinary:', e);
        //         // Decide whether to proceed or halt, here we just log and continue
        //     }
        // }

        await socialLink.deleteOne();
        res.json({ message: 'Social link removed successfully' });
    } catch (error: any) {
        console.error('[Admin SocialLink Controller] Delete Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting social link' });
    }
};