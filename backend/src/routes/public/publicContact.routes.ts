// File: src/routes/public/publicContact.routes.ts

import express from 'express';
import { createContactMessage } from '../../controllers/public/publicContact.controller'; // Adjust path as needed

const router = express.Router();

// This route is prefixed with /api/contact-us
// It's a public endpoint for creating a new contact message.
router.post('/', createContactMessage);

export default router;
