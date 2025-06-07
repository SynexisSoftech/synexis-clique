import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Subcategory, ISubcategory } from '../../models/subCategory.model'; // Adjust path
import { Category } from '../../models/category.model'; // Adjust path
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from '../../services/cloudinary.service'; // Assuming cloudinary service path

/**
 * @desc    Create a new subcategory
 * @route   POST /api/admin/subcategories
 * @access  Private/Admin
 */
export const createSubcategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, categoryId, seoKeywords, tags, image, status } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        res.status(400).json({ message: 'Invalid category ID format' });
        return;
    }

    try {
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) {
            res.status(404).json({ message: 'Parent category not found' });
            return;
        }

        const subcategoryExists = await Subcategory.findOne({ title, categoryId });
        if (subcategoryExists) {
            res.status(400).json({ message: 'Subcategory with this title already exists in the selected category' });
            return;
        }

        let imageUrl: string | undefined;
        if (image) {
            try {
                // Upload image to Cloudinary
                imageUrl = await uploadImageToCloudinary(image, 'subcategories');
            } catch (uploadError: any) {
                console.error('[Admin Subcategory Controller] Cloudinary Upload Error:', uploadError.message);
                res.status(500).json({ message: 'Server error while uploading image' });
                return;
            }
        }

        const subcategory = new Subcategory({
            title,
            description,
            categoryId,
            seoKeywords,
            tags,
            image: imageUrl, // Save the Cloudinary URL
            status: status || 'active',
            createdBy: req.user._id,
        });

        const createdSubcategory = await subcategory.save();
        res.status(201).json(createdSubcategory);
    } catch (error: any) {
        console.error('[Admin Subcategory Controller] Create Subcategory Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while creating subcategory' });
        }
    }
};

/**
 * @desc    Get all subcategories
 * @route   GET /api/admin/subcategories
 * @access  Private/Admin
 */
export const getAllSubcategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const categoryIdFilter = req.query.categoryId as string;
        const statusFilter = req.query.status as string;

        const query: any = {};
        if (categoryIdFilter && mongoose.Types.ObjectId.isValid(categoryIdFilter)) {
            query.categoryId = categoryIdFilter;
        }
        if (statusFilter && ['active', 'inactive'].includes(statusFilter)) {
            query.status = statusFilter;
        }

        const count = await Subcategory.countDocuments(query);
        const subcategories = await Subcategory.find(query)
            .populate('categoryId', 'title')
            .populate('createdBy', 'username email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({
            subcategories,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Admin Subcategory Controller] Get All Subcategories Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching subcategories' });
    }
};

/**
 * @desc    Get subcategory by ID
 * @route   GET /api/admin/subcategories/:id
 * @access  Private/Admin
 */
export const getSubcategoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid subcategory ID format' });
            return;
        }
        const subcategory = await Subcategory.findById(req.params.id)
            .populate('categoryId', 'title')
            .populate('createdBy', 'username email');

        if (subcategory) {
            res.json(subcategory);
        } else {
            res.status(404).json({ message: 'Subcategory not found' });
        }
    } catch (error: any) {
        console.error('[Admin Subcategory Controller] Get Subcategory By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching subcategory' });
    }
};

/**
 * @desc    Update a subcategory
 * @route   PUT /api/admin/subcategories/:id
 * @access  Private/Admin
 */
export const updateSubcategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, categoryId, seoKeywords, tags, image, status } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid subcategory ID format' });
            return;
        }
        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            res.status(404).json({ message: 'Subcategory not found' });
            return;
        }

        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                res.status(400).json({ message: 'Invalid category ID format for update' });
                return;
            }
            const parentCategory = await Category.findById(categoryId);
            if (!parentCategory) {
                res.status(404).json({ message: 'Parent category for update not found' });
                return;
            }
            subcategory.categoryId = categoryId;
        }

        const newTitle = title || subcategory.title;
        const newCategoryId = categoryId || subcategory.categoryId.toString();

        if ((title && title !== subcategory.title) || (categoryId && categoryId !== subcategory.categoryId.toString())) {
            const existingSubcategory = await Subcategory.findOne({ title: newTitle, categoryId: newCategoryId });
            if (existingSubcategory && existingSubcategory._id.toString() !== subcategory._id.toString()) {
                res.status(400).json({ message: 'Another subcategory with this title already exists in the target category' });
                return;
            }
        }

        // Check if a new base64 image is provided for update
        if (image && image.startsWith('data:image')) {
            try {
                const newImageUrl = await uploadImageToCloudinary(image, 'subcategories');
                subcategory.image = newImageUrl;
            } catch (uploadError: any) {
                console.error('[Admin Subcategory Controller] Cloudinary Update Error:', uploadError.message);
                res.status(500).json({ message: 'Server error while updating image' });
                return;
            }
        } else if (image !== undefined) {
             // This allows for clearing the image or setting it to a different URL string
            subcategory.image = image;
        }

        subcategory.title = title || subcategory.title;
        subcategory.description = description || subcategory.description;
        subcategory.seoKeywords = seoKeywords !== undefined ? seoKeywords : subcategory.seoKeywords;
        subcategory.tags = tags !== undefined ? tags : subcategory.tags;
        subcategory.status = status || subcategory.status;

        const updatedSubcategory = await subcategory.save();
        res.json(updatedSubcategory);
    } catch (error: any) {
        console.error('[Admin Subcategory Controller] Update Subcategory Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating subcategory' });
        }
    }
};

/**
 * @desc    Delete a subcategory
 * @route   DELETE /api/admin/subcategories/:id
 * @access  Private/Admin
 */
export const deleteSubcategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid subcategory ID format' });
            return;
        }
        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            res.status(404).json({ message: 'Subcategory not found' });
            return;
        }

        // Add logic here to handle related products if necessary
        // const productsExist = await Product.countDocuments({ subcategoryId: req.params.id });
        // if (productsExist > 0) {
        //     res.status(400).json({ message: 'Cannot delete subcategory. It has associated products.' });
        //     return;
        // }

        await subcategory.deleteOne();
        res.json({ message: 'Subcategory removed successfully' });
    } catch (error: any) {
        console.error('[Admin Subcategory Controller] Delete Subcategory Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting subcategory' });
    }
};