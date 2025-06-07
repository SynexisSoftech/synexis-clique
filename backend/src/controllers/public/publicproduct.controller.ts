import { Response, NextFunction } from 'express';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Subcategory } from '../../models/subCategory.model';
import mongoose from 'mongoose';

/**
 * @desc    Get all active products (public view)
 * @route   GET /api/public/products
 * @access  Public
 */
export const getAllPublicProducts = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.page) || 1;
        const { categoryId, subcategoryId, brand, search, minPrice, maxPrice, sort } = req.query;

        const query: any = { status: 'active' }; // Only show active products

        // Search functionality
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filtering
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId as string)) {
            query.categoryId = categoryId;
        }

        // Subcategory filtering
        if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId as string)) {
            query.subcategoryId = subcategoryId;
        }

        // Brand filtering
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }

        // Price range filtering
        if (minPrice || maxPrice) {
            query.finalPrice = {};
            if (minPrice) query.finalPrice.$gte = Number(minPrice);
            if (maxPrice) query.finalPrice.$lte = Number(maxPrice);
        }

        // Sorting options
        let sortOption: any = { createdAt: -1 }; // Default: newest first
        if (sort === 'price-asc') sortOption = { finalPrice: 1 };
        if (sort === 'price-desc') sortOption = { finalPrice: -1 };
        if (sort === 'popular') sortOption = { rating: -1, reviewsCount: -1 }; // Assuming you have these fields
        if (sort === 'name') sortOption = { title: 1 };

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .select('-createdBy -customDetails -status -__v') // Exclude admin-only fields
            .populate('categoryId', 'title slug')
            .populate('subcategoryId', 'title slug')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortOption);

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Public Product Controller] Get All Products Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

/**
 * @desc    Get product by ID or slug (public view)
 * @route   GET /api/public/products/:identifier
 * @access  Public
 */
export const getPublicProductById = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { identifier } = req.params;

        let query: any;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            query = { _id: identifier, status: 'active' };
        } else {
            query = { slug: identifier, status: 'active' };
        }

        const product = await Product.findOne(query)
            .select('-createdBy -__v') // Exclude admin-only fields
            .populate('categoryId', 'title slug')
            .populate('subcategoryId', 'title slug');

        if (product) {
            // Increment view count (optional)
          (product as any).views = ((product as any).views || 0) + 1;
await product.save();
            await product.save();
            
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found or not available' });
        }
    } catch (error: any) {
        console.error('[Public Product Controller] Get Product By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching product' });
    }
};

/**
 * @desc    Get featured products
 * @route   GET /api/public/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const limit = Number(req.query.limit) || 8;
        
        const products = await Product.find({ 
            status: 'active',
            isFeatured: true 
        })
        .select('-createdBy -__v')
        .limit(limit)
        .sort({ createdAt: -1 });

        res.json(products);
    } catch (error: any) {
        console.error('[Public Product Controller] Get Featured Products Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching featured products' });
    }
};

/**
 * @desc    Get products on sale
 * @route   GET /api/public/products/on-sale
 * @access  Public
 */
export const getProductsOnSale = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const limit = Number(req.query.limit) || 8;
        
        const products = await Product.find({ 
            status: 'active',
            discountPrice: { $exists: true, $ne: null } 
        })
        .select('-createdBy -__v')
        .limit(limit)
        .sort({ discountPercentage: -1 }); // Assuming you have a virtual/discountPercentage field

        res.json(products);
    } catch (error: any) {
        console.error('[Public Product Controller] Get On Sale Products Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching products on sale' });
    }
};

/**
 * @desc    Get related products
 * @route   GET /api/public/products/:id/related
 * @access  Public
 */
export const getRelatedProducts = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const limit = Number(req.query.limit) || 4;
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid product ID format' });
            return;
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        const relatedProducts = await Product.find({
            status: 'active',
            $or: [
                { categoryId: product.categoryId },
                { subcategoryId: product.subcategoryId },
                { brand: product.brand }
            ],
            _id: { $ne: product._id } // Exclude the current product
        })
        .select('-createdBy -__v')
        .limit(limit)
        .sort({ createdAt: -1 });

        res.json(relatedProducts);
    } catch (error: any) {
        console.error('[Public Product Controller] Get Related Products Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching related products' });
    }
};

/**
 * @desc    Get products by category
 * @route   GET /api/public/products/category/:categoryId
 * @access  Public
 */
export const getProductsByCategory = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.page) || 1;
        const { sort } = req.query;

        if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
            res.status(400).json({ message: 'Invalid category ID format' });
            return;
        }

        const category = await Category.findById(req.params.categoryId);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }

        // Sorting options
        let sortOption: any = { createdAt: -1 };
        if (sort === 'price-asc') sortOption = { finalPrice: 1 };
        if (sort === 'price-desc') sortOption = { finalPrice: -1 };
        if (sort === 'popular') sortOption = { rating: -1, reviewsCount: -1 };

        const query = { 
            status: 'active',
            categoryId: req.params.categoryId 
        };

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .select('-createdBy -__v')
            .populate('subcategoryId', 'title slug')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortOption);

        res.json({
            products,
            category,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Public Product Controller] Get Products By Category Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching products by category' });
    }
};

/**
 * @desc    Get products by subcategory
 * @route   GET /api/public/products/subcategory/:subcategoryId
 * @access  Public
 */
export const getProductsBySubcategory = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 12;
        const page = Number(req.query.page) || 1;
        const { sort } = req.query;

        if (!mongoose.Types.ObjectId.isValid(req.params.subcategoryId)) {
            res.status(400).json({ message: 'Invalid subcategory ID format' });
            return;
        }

        const subcategory = await Subcategory.findById(req.params.subcategoryId);
        if (!subcategory) {
            res.status(404).json({ message: 'Subcategory not found' });
            return;
        }

        // Sorting options
        let sortOption: any = { createdAt: -1 };
        if (sort === 'price-asc') sortOption = { finalPrice: 1 };
        if (sort === 'price-desc') sortOption = { finalPrice: -1 };
        if (sort === 'popular') sortOption = { rating: -1, reviewsCount: -1 };

        const query = { 
            status: 'active',
            subcategoryId: req.params.subcategoryId 
        };

        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .select('-createdBy -__v')
            .populate('categoryId', 'title slug')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort(sortOption);

        res.json({
            products,
            subcategory,
            parentCategory: await Category.findById(subcategory.categoryId).select('title slug'),
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Public Product Controller] Get Products By Subcategory Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching products by subcategory' });
    }
};