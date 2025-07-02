import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path as needed
// CORRECTED IMPORTS
import ContactUsModel, { IContactUs } from '../../models/contactUs.model'; // Gets the model
import { ContactQueryStatus } from '../../common/enums'; // Gets the enum from its new location
import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Get all contact messages with pagination and filtering
 * @route   GET /api/admin/contact-us
 * @access  Private/Admin
 */
export const getAllContactMessages = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const statusFilter = req.query.status as string;
        const queryTypeFilter = req.query.queryType as string;

        const query: any = {};
        if (statusFilter && Object.values(ContactQueryStatus).includes(statusFilter as ContactQueryStatus)) {
            query.status = statusFilter;
        }
        if (queryTypeFilter) {
            query.queryType = queryTypeFilter;
        }

        const count = await ContactUsModel.countDocuments(query);
        const messages = await ContactUsModel.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('userId', 'username email') // Populate user details if userId exists
            .sort({ createdAt: -1 });

        res.json({
            messages,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Admin Contact Controller] Get All Messages Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching contact messages' });
    }
});

/**
 * @desc    Get a single contact message by ID
 * @route   GET /api/admin/contact-us/:id
 * @access  Private/Admin
 */
export const getContactMessageById = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid message ID format' });
            return;
        }

        const message = await ContactUsModel.findById(req.params.id).populate('userId', 'username email');

        if (message) {
            res.json(message);
        } else {
            res.status(404).json({ message: 'Contact message not found' });
        }
    } catch (error: any) {
        console.error('[Admin Contact Controller] Get Message By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching contact message' });
    }
});

/**
 * @desc    Update a contact message's status or add admin notes
 * @route   PUT /api/admin/contact-us/:id
 * @access  Private/Admin
 */
export const updateContactMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const { status, adminNotes } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid message ID format' });
            return;
        }

        const message = await ContactUsModel.findById(req.params.id);

        if (!message) {
            res.status(404).json({ message: 'Contact message not found' });
            return;
        }

        if (status && Object.values(ContactQueryStatus).includes(status as ContactQueryStatus)) {
            message.status = status as ContactQueryStatus;
        }
        
        if (adminNotes !== undefined) {
             message.adminNotes = adminNotes;
        }

        const updatedMessage = await message.save();
        res.json(updatedMessage);

    } catch (error: any) {
        console.error('[Admin Contact Controller] Update Message Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating contact message' });
        }
    }
});


/**
 * @desc    Delete a contact message
 * @route   DELETE /api/admin/contact-us/:id
 * @access  Private/Admin
 */
export const deleteContactMessage = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid message ID format' });
            return;
        }

        const message = await ContactUsModel.findById(req.params.id);

        if (!message) {
            res.status(404).json({ message: 'Contact message not found' });
            return;
        }

        await message.deleteOne();
        res.json({ message: 'Contact message removed successfully' });

    } catch (error: any) {
        console.error('[Admin Contact Controller] Delete Message Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting contact message' });
    }
});