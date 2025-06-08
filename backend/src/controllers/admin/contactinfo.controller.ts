import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path as needed
import { ContactInfo, IContactInfo } from '../../models/contactInfo.model'; // Adjust path as needed
import mongoose from 'mongoose';

/**
 * @desc    Create or Update Contact Info
 * @route   POST /api/admin/contact-info
 * @access  Private/Admin
 */
export const createOrUpdateContactInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { phoneNumbers, emails, locations } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        // Since there's typically only one contact info document, we use findOne and update it.
        // If it doesn't exist, we create it (upsert: true).
        let contactInfo = await ContactInfo.findOne();

        if (contactInfo) {
            // Update existing document
            contactInfo.phoneNumbers = phoneNumbers || contactInfo.phoneNumbers;
            contactInfo.emails = emails || contactInfo.emails;
            contactInfo.locations = locations || contactInfo.locations;
            contactInfo.updatedBy = req.user._id;
        } else {
            // Create a new document
            contactInfo = new ContactInfo({
                phoneNumbers,
                emails,
                locations,
                updatedBy: req.user._id,
            });
        }

        const updatedContactInfo = await contactInfo.save();
        res.status(contactInfo ? 200 : 201).json(updatedContactInfo);

    } catch (error: any) {
        console.error('[Admin ContactInfo Controller] Create/Update Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while saving contact information' });
        }
    }
};

/**
 * @desc    Update Contact Info by ID
 * @route   PUT /api/admin/contact-info/:id
 * @access  Private/Admin
 */
export const updateContactInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { phoneNumbers, emails, locations } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid contact info ID format' });
            return;
        }

        const contactInfo = await ContactInfo.findById(req.params.id);

        if (!contactInfo) {
            res.status(404).json({ message: 'Contact information not found' });
            return;
        }

        // Update fields if they are provided in the request
        if (phoneNumbers) contactInfo.phoneNumbers = phoneNumbers;
        if (emails) contactInfo.emails = emails;
        if (locations) contactInfo.locations = locations;
        contactInfo.updatedBy = req.user._id;

        const updatedContactInfo = await contactInfo.save();
        res.json(updatedContactInfo);

    } catch (error: any) {
        console.error('[Admin ContactInfo Controller] Update Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating contact information' });
        }
    }
};

/**
 * @desc    Get Contact Info
 * @route   GET /api/admin/contact-info
 * @access  Private/Admin
 */
export const getContactInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const contactInfo = await ContactInfo.findOne().populate('updatedBy', 'username email');
        if (contactInfo) {
            res.json(contactInfo);
        } else {
            // Return an empty or default structure if no contact info has been created yet
            res.status(404).json({ message: 'Contact information not found. Please create it first.' });
        }
    } catch (error: any) {
        console.error('[Admin ContactInfo Controller] Get Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching contact information' });
    }
};

/**
 * @desc    Get Contact Info by ID
 * @route   GET /api/admin/contact-info/:id
 * @access  Private/Admin
 */
export const getContactInfoById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid contact info ID format' });
            return;
        }
        const contactInfo = await ContactInfo.findById(req.params.id).populate('updatedBy', 'username email');
        if (contactInfo) {
            res.json(contactInfo);
        } else {
            res.status(404).json({ message: 'Contact information not found' });
        }
    } catch (error: any) {
        console.error('[Admin ContactInfo Controller] Get By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching contact information' });
    }
};

/**
 * @desc    Delete Contact Info
 * @route   DELETE /api/admin/contact-info/:id
 * @access  Private/Admin
 */
export const deleteContactInfo = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid contact info ID format' });
            return;
        }
        const contactInfo = await ContactInfo.findById(req.params.id);

        if (!contactInfo) {
            res.status(404).json({ message: 'Contact information not found' });
            return;
        }

        await contactInfo.deleteOne();
        res.json({ message: 'Contact information removed successfully' });
    } catch (error: any) {
        console.error('[Admin ContactInfo Controller] Delete Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting contact information' });
    }
};