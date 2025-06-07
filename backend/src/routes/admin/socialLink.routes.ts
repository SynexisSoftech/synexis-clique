import express from 'express';
import {
    createSocialLink,
    getAllSocialLinks,
    updateSocialLink,
    deleteSocialLink,
} from '../../controllers/admin/sociallinks.controller'; // Adjust path

// Import your specific middleware functions
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path

// You must also import the UserRole enum to pass it to the authorize function
import { UserRole } from '../../models/user.model'; // Adjust path to your user model

const router = express.Router();

/**
 * All routes in this file are prefixed with `/api/admin/social-links` in your main app.
 * * Middleware Execution Order:
 * 1. `protect`: Verifies the JWT token. If valid, it attaches the user object to `req.user`.
 * 2. `authorize([UserRole.Admin])`: Checks if `req.user.role` is 'admin'. This must run AFTER `protect`.
 */

router.route('/')
    .post(protect, authorize([UserRole.ADMIN]), createSocialLink)
    .get(protect, authorize([UserRole.ADMIN]), getAllSocialLinks);

router.route('/:id')
    .put(protect, authorize([UserRole.ADMIN]), updateSocialLink)
    .delete(protect, authorize([UserRole.ADMIN]), deleteSocialLink);

export default router;