import express from 'express';
import { protect } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/admin.middleware';
import { adminActionLimiter, adminCriticalActionLimiter } from '../../middleware/rateLimiter';
import { csrfProtection } from '../../middleware/csrf.middleware';

// Import admin controllers
import * as adminCategoryController from '../../controllers/admin/category.controller'; // Adjust path
import * as adminSubcategoryController from '../../controllers/admin/subcategory.controller'; // Adjust path
import * as adminProductController from '../../controllers/admin/product.controller'; // Adjust path
import * as adminReviewController from '../../controllers/admin/review.controller'; // Adjust path
import * as adminOrderController from '../../controllers/admin/order.controller'; // Add order controller import

const router = express.Router();

// Middleware for all admin routes: must be logged in and must be an ADMIN
router.use(protect); // Ensures user is logged in
router.use(requireAdmin); // Ensures user is an admin
router.use(adminActionLimiter); // Apply admin rate limiting to all admin routes
router.use(csrfProtection); // Apply CSRF protection to all admin routes

// Category Routes
router.route('/categories')
    .post(adminCriticalActionLimiter, adminCategoryController.createCategory)
    .get(adminCategoryController.getAllCategories);
router.route('/categories/:id')
    .get(adminCategoryController.getCategoryById)
    .put(adminCriticalActionLimiter, adminCategoryController.updateCategory)
    .delete(adminCriticalActionLimiter, adminCategoryController.deleteCategory);

// Subcategory Routes
router.route('/subcategories')
    .post(adminCriticalActionLimiter, adminSubcategoryController.createSubcategory)
    .get(adminSubcategoryController.getAllSubcategories);
router.route('/subcategories/:id')
    .get(adminSubcategoryController.getSubcategoryById)
    .put(adminCriticalActionLimiter, adminSubcategoryController.updateSubcategory)
    .delete(adminCriticalActionLimiter, adminSubcategoryController.deleteSubcategory);

// Product Routes
router.route('/products')
    .post(adminCriticalActionLimiter, adminProductController.createProduct)
    .get(adminProductController.getAllProducts);
router.route('/products/:id')
    .get(adminProductController.getProductById)
    .put(adminCriticalActionLimiter, adminProductController.updateProduct)
    .delete(adminCriticalActionLimiter, adminProductController.deleteProduct);
router.route('/products/:productId/orders')
    .get(adminOrderController.getOrdersByProductId);

// Review Routes (Admin Management)
router.route('/reviews')
    .get(adminReviewController.getAllReviews);
router.route('/reviews/:id')
    .get(adminReviewController.getReviewById)
    .delete(adminCriticalActionLimiter, adminReviewController.deleteReview);
router.route('/reviews/:id/status')
    .put(adminCriticalActionLimiter, adminReviewController.updateReviewStatus);


export default router; // Export the admin router