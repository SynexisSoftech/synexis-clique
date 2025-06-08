import express from 'express';
import {
    createOrUpdateContactInfo,
    getContactInfo,
    getContactInfoById,
    updateContactInfo,
    deleteContactInfo
} from '../../controllers/admin/contactinfo.controller'; // Adjust path as needed
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path as needed
import { UserRole } from '../../models/user.model'; // Adjust path as needed

const router = express.Router();

// All routes in this file are protected and restricted to Admins.
router.use(protect);
router.use(authorize([UserRole.ADMIN])); // Assuming 'admin' is a value in your UserRole enum

// Routes for /api/admin/contact-info
router.route('/')
    .post(createOrUpdateContactInfo)
    .get(getContactInfo);

router.route('/:id')
    .get(getContactInfoById)
    .put(updateContactInfo)  // Added PUT route for update
    .delete(deleteContactInfo);

export default router;