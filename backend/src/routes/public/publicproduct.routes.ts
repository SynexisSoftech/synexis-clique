import express from 'express';
import {
    getAllPublicProducts,
    getPublicProductById,
    getFeaturedProducts,
    getProductsOnSale,
    getRelatedProducts,
    getProductsByCategory,
    getProductsBySubcategory
} from '../../controllers/public/publicproduct.controller';

const router = express.Router();

// Public product routes
router.get('/', getAllPublicProducts);
router.get('/featured', getFeaturedProducts);
router.get('/on-sale', getProductsOnSale);
router.get('/:identifier', getPublicProductById);
router.get('/:id/related', getRelatedProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/subcategory/:subcategoryId', getProductsBySubcategory);

export default router;