import { Request, Response } from 'express';
import ContactUsModel from '../../models/contactUs.model'; // Adjust path as needed
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path as needed, used for optional user ID
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Create a new contact message
 * @route   POST /api/contact-us
 * @access  Public
 */
export const createContactMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const { name, email, phone, queryType, description } = req.body;

    try {
        // userId is optional. It can be attached if the user is logged in.
        const userId = req.user ? req.user._id : undefined;

        const contactMessage = new ContactUsModel({
            userId,
            name,
            email,
            phone,
            queryType,
            description,
            // Status will default to 'UNREAD' as per the schema
        });

        const createdMessage = await contactMessage.save();
        res.status(201).json({ 
            message: 'Your message has been received. We will get back to you shortly.',
            data: createdMessage 
        });

    } catch (error: any) {
        console.error('[Public Contact Controller] Create Message Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while submitting your message' });
        }
    }
};