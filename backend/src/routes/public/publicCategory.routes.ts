import express from 'express';
import { getAllPublicCategories, getPublicCategoryBySlug } from '../../controllers/public/publicCategory.controller'; // Adjust path

const router = express.Router();

router.get('/categories', getAllPublicCategories);
router.get('/categories/:slug', getPublicCategoryBySlug);

export default router;