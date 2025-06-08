import { Request, Response } from 'express';
import { ContactInfo } from '../../models/contactInfo.model';
import mongoose from 'mongoose';

// Extend Express Request type to include user from authMiddleware
interface IAuthRequest extends Request {
  user?: { id: string }; // or your full user type
}

/**
 * @desc    Create or update the website's contact info
 * @route   POST /api/contact/admin
 * @access  Admin
 */
export const createOrUpdateContactInfo = async (req: IAuthRequest, res: Response): Promise<void> => {
  try {
    const adminUserId = req.user?.id;
    if (!adminUserId) {
        res.status(400).json({ message: 'Admin user not found in request.' });
        return;
    }

    const contactData = { ...req.body, updatedBy: adminUserId };

    // Find the single document and update it, or create it if it doesn't exist.
    const updatedContactInfo = await ContactInfo.findOneAndUpdate(
      {}, // An empty filter will match the first (and only) document
      contactData,
      {
        new: true, // Return the modified document
        upsert: true, // Create the document if it does not exist
        runValidators: true, // Ensure the new data adheres to the schema
      }
    );

    res.status(200).json(updatedContactInfo);
  } catch (error: any) {
    console.error('[Admin Contact Controller] Update Error:', error.message);
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(400).json({ message: 'Validation Error', errors: error.errors });
        return;
    }
    res.status(500).json({ message: 'Server error while updating contact information.' });
  }
};

/**
 * @desc    Get the contact info for the admin dashboard
 * @route   GET /api/contact/admin
 * @access  Admin
 */
export const getAdminContactInfo = async (req: IAuthRequest, res: Response): Promise<void> => {
    try {
        const contactInfo = await ContactInfo.findOne().populate('updatedBy', 'name email');

        if (!contactInfo) {
            // Return an empty structure so the admin panel can render the form fields
            res.json({
                phoneNumbers: [],
                emails: [],
                locations: [],
                socialMedia: [],
            });
            return;
        }

        res.json(contactInfo);
    } catch (error: any) {
        console.error('[Admin Contact Controller] Get Error:', error.message);
        res.status(500).json({ message: 'Server error fetching contact data.' });
    }
};