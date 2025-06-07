import express from 'express';
import {
    getPublicSubcategories,
    getPublicSubcategoryBySlug,
} from '../../controllers/public/subcategory.public.controller'; // Adjust path

const router = express.Router();

// Route to get all active subcategories, with optional filtering
router.get('/', getPublicSubcategories);

// Route to get a single subcategory by its parent's slug and its own slug
router.get('/:categorySlug/:subcategorySlug', getPublicSubcategoryBySlug);

export default router;