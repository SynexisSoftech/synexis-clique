import { Request, Response } from 'express';
import { Subcategory } from '../../models/subCategory.model'; // Adjust path
import { Category } from '../../models/category.model'; // Adjust path

/**
 * @desc    Fetch all active subcategories, optionally filtered by parent category slug
 * @route   GET /api/public/subcategories?categorySlug=<slug>
 * @access  Public
 */
export const getPublicSubcategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categorySlug } = req.query;

        const query: any = { status: 'active' };

        // If a category slug is provided, filter by it
        if (categorySlug && typeof categorySlug === 'string') {
            const parentCategory = await Category.findOne({ slug: categorySlug, status: 'active' });
            if (!parentCategory) {
                res.json([]); // Return empty array if parent category doesn't exist
                return;
            }
            query.categoryId = parentCategory._id;
        }

        const subcategories = await Subcategory.find(query)
            .select('title slug description image categoryId') // Select only public fields
            .populate({
                path: 'categoryId',
                select: 'title slug' // Populate parent category's title and slug
            })
            .sort({ title: 1 });

        res.json(subcategories);
    } catch (error: any) {
        console.error('[Public Subcategory Controller] Get All Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching subcategories' });
    }
};

/**
 * @desc    Fetch a single active subcategory by its slug and parent category's slug
 * @route   GET /api/public/subcategories/:categorySlug/:subcategorySlug
 * @access  Public
 */
export const getPublicSubcategoryBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categorySlug, subcategorySlug } = req.params;

        // First, find the parent category to get its ID
        const parentCategory = await Category.findOne({ slug: categorySlug, status: 'active' });
        if (!parentCategory) {
            res.status(404).json({ message: 'Parent category not found' });
            return;
        }

        // Now find the subcategory using its slug AND the parent category's ID
        const subcategory = await Subcategory.findOne({
            slug: subcategorySlug,
            categoryId: parentCategory._id,
            status: 'active',
        })
        .select('title slug description image seoKeywords tags categoryId') // Select public fields
        .populate({
            path: 'categoryId',
            select: 'title slug' // Also populate parent info for context
        });

        if (subcategory) {
            res.json(subcategory);
        } else {
            res.status(404).json({ message: 'Subcategory not found' });
        }
    } catch (error: any) {
        console.error('[Public Subcategory Controller] Get By Slug Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching subcategory' });
    }
};