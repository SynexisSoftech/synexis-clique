import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path as needed
import { Category, ICategory } from '../../models/category.model'; // Adjust path as needed
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from '../../services/cloudinary.service'; // Adjust path to your Cloudinary service

/**
 * @desc    Create a new category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let { title, description, seoKeywords, tags, image, status } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    try {
        const categoryExists = await Category.findOne({ title });
        if (categoryExists) {
            res.status(400).json({ message: 'Category with this title already exists' });
            return;
        }

        let imageUrl = image; // Default to existing image value (which might be null or a URL)

        // If 'image' is provided and is a base64 string (not a URL)
        if (image && typeof image === 'string' && !image.startsWith('http')) {
            try {
                // Assuming 'image' is a base64 encoded string
                imageUrl = await uploadImageToCloudinary(image, 'category_images');
            } catch (uploadError: any) {
                console.error('[Admin Category Controller] Cloudinary Upload Error:', uploadError.message);
                res.status(500).json({ message: 'Image upload failed. Please try again.' });
                return;
            }
        }

        const category = new Category({
            title,
            description,
            seoKeywords,
            tags,
            image: imageUrl, // Use the potentially uploaded image URL
            status: status || 'active',
            createdBy: req.user._id,
        });

        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    } catch (error: any) {
        console.error('[Admin Category Controller] Create Category Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else if (error.message !== 'Image upload failed. Please try again.') { // Avoid double response
            res.status(500).json({ message: 'Server error while creating category' });
        }
    }
};

/**
 * @desc    Get all categories
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
export const getAllCategories = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const statusFilter = req.query.status as string;

        const query: any = {};
        if (statusFilter && ['active', 'inactive'].includes(statusFilter)) {
            query.status = statusFilter;
        }

        const count = await Category.countDocuments(query);
        const categories = await Category.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('createdBy', 'username email')
            .sort({ createdAt: -1 });

        res.json({
            categories,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Admin Category Controller] Get All Categories Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
};

/**
 * @desc    Get category by ID
 * @route   GET /api/admin/categories/:id
 * @access  Private/Admin
 */
export const getCategoryById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid category ID format' });
            return;
        }
        const category = await Category.findById(req.params.id).populate('createdBy', 'username email');
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error: any) {
        console.error('[Admin Category Controller] Get Category By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching category' });
    }
};

/**
 * @desc    Update a category
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const { title, description, seoKeywords, tags, image, status } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid category ID format' });
            return;
        }
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        // Check if new title conflicts with another category
        if (title && title !== category.title) {
            const existingCategoryWithNewTitle = await Category.findOne({ title });
            if (existingCategoryWithNewTitle && existingCategoryWithNewTitle._id.toString() !== category._id.toString()) {
                res.status(400).json({ message: 'Another category with this title already exists' });
                return;
            }
        }

        let newImageUrl = category.image; // Default to current image

        // If 'image' is provided in the request body for update
        if (image && typeof image === 'string') {
            if (!image.startsWith('http')) { // Assume it's a base64 string for upload
                try {
                    // Optional: Implement logic to delete the old image from Cloudinary if category.image exists and is a Cloudinary URL
                    // e.g., if (category.image && category.image.includes('cloudinary')) {
                    //    const publicId = extractPublicIdFromUrl(category.image);
                    //    await cloudinary.uploader.destroy(publicId);
                    // }
                    newImageUrl = await uploadImageToCloudinary(image, 'category_images');
                } catch (uploadError: any) {
                    console.error('[Admin Category Controller] Cloudinary Upload Error on Update:', uploadError.message);
                    res.status(500).json({ message: 'Image upload failed during update. Please try again.' });
                    return;
                }
            } else {
                newImageUrl = image; // It's a new URL, update to it
            }
        } else if (image === null || image === '') { // Handle explicit image removal
            // Optional: Implement logic to delete the old image from Cloudinary
            newImageUrl = undefined; // Or null, depending on your schema how you represent no image
        }


        category.title = title || category.title;
        category.description = description || category.description;
        category.seoKeywords = seoKeywords !== undefined ? seoKeywords : category.seoKeywords;
        category.tags = tags !== undefined ? tags : category.tags;
        category.image = newImageUrl; // Update with the new image URL or undefined
        category.status = status || category.status;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error: any) {
        console.error('[Admin Category Controller] Update Category Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else if (error.message !== 'Image upload failed during update. Please try again.') {
            res.status(500).json({ message: 'Server error while updating category' });
        }
    }
};

/**
 * @desc    Delete a category
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid category ID format' });
            return;
        }
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        // Optional: Before deleting the category document, delete its image from Cloudinary
        // if (category.image && category.image.includes('cloudinary')) {
        //     try {
        //         const publicId = extractPublicIdFromUrl(category.image); // You'll need to implement extractPublicIdFromUrl
        //         await cloudinary.uploader.destroy(publicId);
        //     } catch (e) {
        //         console.error('[Admin Category Controller] Failed to delete image from Cloudinary:', e);
        //         // Decide if you want to stop the category deletion or just log the error
        //     }
        // }
        
        // Add logic here if you need to handle related subcategories or products
        // For example, check if any subcategories or products are using this category

        await category.deleteOne(); // Mongoose 7+ uses deleteOne() for documents
        res.json({ message: 'Category removed successfully' });
    } catch (error: any) {
        console.error('[Admin Category Controller] Delete Category Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting category' });
    }
};