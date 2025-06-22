// File: src/routes/admin/adminContact.routes.ts

import express from 'express';
import {
    getAllContactMessages,
    getContactMessageById,
    updateContactMessage,
    deleteContactMessage
} from '../../controllers/admin/adminContact.controller'; // Adjust path as needed
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path as needed
import { UserRole } from '../../models/user.model'; // Adjust path as needed

const router = express.Router();

// All routes here are prefixed with /api/admin/contact-us
// They are protected and only accessible by users with the ADMIN role.

router.route('/')
    .get(protect, authorize([UserRole.ADMIN]), getAllContactMessages);

router.route('/:id')
    .get(protect, authorize([UserRole.ADMIN]), getContactMessageById)
    .put(protect, authorize([UserRole.ADMIN]), updateContactMessage)
    .delete(protect, authorize([UserRole.ADMIN]), deleteContactMessage);

export default router;
