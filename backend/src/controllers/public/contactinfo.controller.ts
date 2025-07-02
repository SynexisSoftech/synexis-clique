import { Response, NextFunction } from 'express';
import { ContactInfo } from '../../models/contactInfo.model'; // Adjust path as needed
import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Get Public Contact Info
 * @route   GET /api/contact-info
 * @access  Public
 */
export const getPublicContactInfo = asyncHandler(async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const contactInfo = await ContactInfo.findOne().select('-updatedBy -createdAt -updatedAt -__v');
        
        if (contactInfo) {
            res.json({
                phoneNumbers: contactInfo.phoneNumbers,
                emails: contactInfo.emails,
                locations: contactInfo.locations
            });
        } else {
            // Return an empty response if no contact info exists
            res.json({
                phoneNumbers: [],
                emails: [],
                locations: []
            });
        }
    } catch (error: any) {
        console.error('[Public ContactInfo Controller] Get Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching contact information' });
    }
});

/**
 * @desc    Get Public Contact Info by ID
 * @route   GET /api/contact-info/:id
 * @access  Public
 */
export const getPublicContactInfoById = asyncHandler(async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid contact info ID format' });
            return;
        }
        
        const contactInfo = await ContactInfo.findById(req.params.id).select('-updatedBy -createdAt -updatedAt -__v');
        
        if (contactInfo) {
            res.json({
                phoneNumbers: contactInfo.phoneNumbers,
                emails: contactInfo.emails,
                locations: contactInfo.locations
            });
        } else {
            res.status(404).json({ message: 'Contact information not found' });
        }
    } catch (error: any) {
        console.error('[Public ContactInfo Controller] Get By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching contact information' });
    }
});