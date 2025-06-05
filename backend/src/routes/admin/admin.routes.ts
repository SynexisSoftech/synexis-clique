import express from 'express';
import { protect, authorize } from '../../middleware/auth.middleware'; // Adjust path
import { UserRole } from '../../models/user.model'; // Adjust path

// Import admin controllers
import * as adminCategoryController from '../../controllers/admin/category.controller'; // Adjust path
import * as adminSubcategoryController from '../../controllers/admin/subcategory.controller'; // Adjust path
import * as adminProductController from '../../controllers/admin/product.controller'; // Adjust path
import * as adminReviewController from '../../controllers/admin/review.controller'; // Adjust path

const router = express.Router();

// Middleware for all admin routes: must be logged in and must be an ADMIN
router.use(protect); // Ensures user is logged in
router.use(authorize([UserRole.ADMIN])); // Ensures user is an admin

// Category Routes
router.route('/categories')
    .post(adminCategoryController.createCategory)
    .get(adminCategoryController.getAllCategories);
router.route('/categories/:id')
    .get(adminCategoryController.getCategoryById)
    .put(adminCategoryController.updateCategory)
    .delete(adminCategoryController.deleteCategory);

// Subcategory Routes
router.route('/subcategories')
    .post(adminSubcategoryController.createSubcategory)
    .get(adminSubcategoryController.getAllSubcategories);
router.route('/subcategories/:id')
    .get(adminSubcategoryController.getSubcategoryById)
    .put(adminSubcategoryController.updateSubcategory)
    .delete(adminSubcategoryController.deleteSubcategory);

// Product Routes
router.route('/products')
    .post(adminProductController.createProduct)
    .get(adminProductController.getAllProducts);
router.route('/products/:id')
    .get(adminProductController.getProductById)
    .put(adminProductController.updateProduct)
    .delete(adminProductController.deleteProduct);

// Review Routes (Admin Management)
router.route('/reviews')
    .get(adminReviewController.getAllReviews);
router.route('/reviews/:id')
    .get(adminReviewController.getReviewById)
    .delete(adminReviewController.deleteReview);
router.route('/reviews/:id/status')
    .put(adminReviewController.updateReviewStatus);


export default router; // Export the admin router