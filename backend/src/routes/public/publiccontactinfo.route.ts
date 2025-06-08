import express from 'express';
import {
    getPublicContactInfo,
    getPublicContactInfoById
} from '../../controllers/public/contactinfo.controller'; // Adjust path as needed

const router = express.Router();

// Public routes - no authentication required
router.route('/')
    .get(getPublicContactInfo);

router.route('/:id')
    .get(getPublicContactInfoById);

export default router;