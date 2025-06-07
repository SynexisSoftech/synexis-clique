import { Request, Response, NextFunction } from 'express';
import { Category } from '../../models/category.model'; // Adjust path as needed

/**
 * @desc    Get all active categories for public view
 * @route   GET /api/public/categories
 * @access  Public
 */
export const getAllPublicCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const categories = await Category.find({ status: 'active' })
            .select('title slug description image') // Select only the fields needed for public view
            .sort({ title: 1 }); // Sort alphabetically by title

        res.json(categories);
    } catch (error: any) {
        console.error('[Public Category Controller] Get All Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
};

/**
 * @desc    Get a single active category by its slug
 * @route   GET /api/public/categories/:slug
 * @access  Public
 */
export const getPublicCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const category = await Category.findOne({ 
            slug: req.params.slug, 
            status: 'active' 
        }).select('title slug description image seoKeywords tags'); // You might want more fields for a single view

        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error: any) {
        console.error('[Public Category Controller] Get By Slug Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching category' });
    }
};