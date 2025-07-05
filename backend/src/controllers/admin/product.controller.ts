import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { Product, IProduct } from '../../models/product.model'; // Adjust path
import { Category } from '../../models/category.model'; // Adjust path
import { Subcategory } from '../../models/subCategory.model'; // Adjust path
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from '../../services/cloudinary.service';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Create a new product
 * @route   POST /api/admin/products
 * @access  Private/Admin
 * @notes   This controller expects `req.body.images` to be an array of image URLs.
 * Actual file uploads should be handled by a middleware (e.g., multer)
 * before this controller is invoked. The middleware would then populate
 * `req.body.images` with the URLs of the uploaded images.
 */
export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    // Log the received body to debug
    console.log('[Admin Product Controller] Create Product req.body:', JSON.stringify(req.body, null, 2));

    const {
        title, description, shortDescription, categoryId, subcategoryId,
        originalPrice, // Tax-inclusive price (what admin enters)
        discountPrice, // Tax-inclusive discounted price
        stockQuantity, // Expecting this to be a number or string convertible to number
        features, colors, sizes, brand, seoKeywords,
        tags, returnPolicy, warranty, weight, dimensions, material,
        images, // Expecting this to be an array of base64 data URIs from frontend
        customDetails, status, isCashOnDeliveryAvailable
    } = req.body;

    if (!req.user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
    }

    // --- Basic Validations ---
    if (!title || title.trim() === "") {
        res.status(400).json({ message: 'Product title is required.' });
        return;
    }
    // Validate originalPrice before Mongoose does, to give clearer error or ensure it's a number
    const numOriginalPrice = Number(originalPrice);
    if (originalPrice === undefined || originalPrice === null || String(originalPrice).trim() === "" || isNaN(numOriginalPrice)) {
        res.status(400).json({ message: 'Original price is required and must be a valid number.' });
        return;
    }
    if (numOriginalPrice < 0) {
        res.status(400).json({ message: 'Original price cannot be negative.' });
        return;
    }

    const numStockQuantity = Number(stockQuantity);
    if (stockQuantity === undefined || stockQuantity === null || String(stockQuantity).trim() === "" || isNaN(numStockQuantity) || !Number.isInteger(numStockQuantity)) {
        res.status(400).json({ message: 'Stock quantity is required and must be a valid integer.' });
        return;
    }
     if (numStockQuantity < 0) {
        res.status(400).json({ message: 'Stock quantity cannot be negative.' });
        return;
    }

    // Calculate base price (price before tax)
    const basePrice = Math.round(numOriginalPrice / (1 + Number(0.13)));

    let numDiscountPrice: number | undefined | null = undefined;
    let discountBasePrice: number | undefined | null = undefined;
    
    if (discountPrice !== undefined && discountPrice !== null && String(discountPrice).trim() !== "") {
        numDiscountPrice = Number(discountPrice);
        if (isNaN(numDiscountPrice)) {
            res.status(400).json({ message: 'Discount price must be a valid number if provided.' });
            return;
        }
        if (numDiscountPrice < 0) {
            res.status(400).json({ message: 'Discount price cannot be negative.' });
            return;
        }
        if (numDiscountPrice >= numOriginalPrice) {
            res.status(400).json({ message: 'Discount price must be less than original price.' });
            return;
        }
        // Calculate discount base price
        discountBasePrice = Math.round(numDiscountPrice / (1 + Number(0.13)));
    } else if (discountPrice === null) {
        numDiscountPrice = null;
        discountBasePrice = null;
    }

    // Validate tax rate
    const numTaxRate = 0.13; // Fixed 13% VAT rate for Nepal

    // Validate images array (now expecting base64 strings)
    if (!Array.isArray(images) || images.length === 0) {
        res.status(400).json({ message: 'Product must have at least one image. `images` should be a non-empty array of base64 encoded data URIs.' });
        return;
    }
    // Basic check for base64 data URI format
    if (!images.every(img => typeof img === 'string' && img.startsWith('data:image/'))) {
        res.status(400).json({ message: 'All items in the `images` array must be valid base64 data URIs (e.g., "data:image/jpeg;base64,...").' });
        return;
    }

    try {
        // --- Category and Subcategory Validation ---
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            res.status(400).json({ message: 'Invalid category ID format' });
            return;
        }
        const parentCategory = await Category.findById(categoryId);
        if (!parentCategory) {
            res.status(404).json({ message: 'Parent category not found' });
            return;
        }
        if (subcategoryId) { // Subcategory is optional
            if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
                res.status(400).json({ message: 'Invalid subcategory ID format' });
                return;
            }
            const parentSubcategory = await Subcategory.findOne({ _id: subcategoryId, categoryId: categoryId });
            if (!parentSubcategory) {
                res.status(404).json({ message: 'Parent subcategory not found or does not belong to the specified category' });
                return;
            }
        }

        // --- Image Upload to Cloudinary ---
        const uploadedImageUrls: string[] = [];
        for (const base64Image of images) { // `images` from req.body are base64 data URIs
            try {
                // Make sure your uploadImageToCloudinary can handle the full data URI
                const imageUrl = await uploadImageToCloudinary(base64Image, 'products');
                uploadedImageUrls.push(imageUrl);
            } catch (uploadError: any) {
                console.error('[Admin Product Controller] Cloudinary Upload Error:', uploadError.message);
                res.status(500).json({ message: 'Image upload failed during product creation.', error: uploadError.message });
                return; // Stop if any image upload fails
            }
        }

        // --- Create and Save Product ---
        const product = new Product({
            title, description, shortDescription, categoryId,
            subcategoryId: subcategoryId || undefined, // Handle optional subcategory
            originalPrice: numOriginalPrice, // Tax-inclusive price
            discountPrice: numDiscountPrice, // Tax-inclusive discounted price
            basePrice: basePrice, // Price before tax
            discountBasePrice: discountBasePrice, // Discounted price before tax
            taxRate: numTaxRate, // Tax rate
            stockQuantity: numStockQuantity, // Use parsed number
            features, colors, sizes, brand, seoKeywords,
            tags, returnPolicy, warranty, weight, dimensions, material,
            images: uploadedImageUrls, // Use URLs from Cloudinary
            customDetails,
            status: status || 'active', // Default status
            isCashOnDeliveryAvailable: isCashOnDeliveryAvailable === undefined ? true : Boolean(isCashOnDeliveryAvailable),
            createdBy: req.user._id,
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);

    } catch (error: any) {
        console.error('[Admin Product Controller] Create Product Error:', error.message);
        if (error.name === 'ValidationError') {
            // Log the detailed validation errors
            console.error('[Admin Product Controller] Mongoose Validation Errors:', JSON.stringify(error.errors, null, 2));
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while creating product', error: error.message });
        }
    }
};

/**
 * @desc    Get all products (admin view)
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
export const getAllProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const { categoryId, subcategoryId, status: statusFilter, brand, search, cod } = req.query;

        const query: any = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId as string)) {
            query.categoryId = categoryId;
        }
        if (subcategoryId && mongoose.Types.ObjectId.isValid(subcategoryId as string)) {
            query.subcategoryId = subcategoryId;
        }
        if (statusFilter && ['active', 'inactive', 'out-of-stock'].includes(statusFilter as string)) {
            query.status = statusFilter;
        }
        if (brand) {
            query.brand = { $regex: brand, $options: 'i' };
        }
        if (cod !== undefined) {
            query.isCashOnDeliveryAvailable = String(cod).toLowerCase() === 'true';
        }


        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .populate('categoryId', 'title')
            .populate('subcategoryId', 'title')
            .populate('createdBy', 'username email')
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .sort({ createdAt: -1 });

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Admin Product Controller] Get All Products Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching products' });
    }
};

/**
 * @desc    Get product by ID (admin view)
 * @route   GET /api/admin/products/:id
 * @access  Private/Admin
 */
export const getProductById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid product ID format' });
            return;
        }
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'title description')
            .populate('subcategoryId', 'title description')
            .populate('createdBy', 'username email');

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error: any) {
        console.error('[Admin Product Controller] Get Product By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching product' });
    }
};

/**
 * @desc    Update a product
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 * @notes   If `req.body.images` is provided, it's expected to be an array of image URLs
 * and will replace the existing images.
 * Actual file uploads should be handled by middleware (e.g., multer).
 */
export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const {
        title, description, shortDescription, categoryId, subcategoryId, originalPrice,
        discountPrice, stockQuantity, features, colors, sizes, brand, seoKeywords,
        tags, returnPolicy, warranty, weight, dimensions, material, images, // Expected to be an array of URLs
        customDetails, status, isCashOnDeliveryAvailable
    } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid product ID format' });
            return;
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Validate images array if provided for update
        if (images !== undefined) { // Check if images field is present in the request
            if (!Array.isArray(images) || images.length === 0) {
                res.status(400).json({ message: 'If updating images, the `images` field must be a non-empty array of URLs.' });
                return;
            }
            if (!images.every(img => typeof img === 'string' && img.trim() !== '')) {
                res.status(400).json({ message: 'All items in the `images` array must be non-empty strings (URLs).' });
                return;
            }
            product.images = images; // Replace existing images
        }


        // Validate category and subcategory if provided
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
            product.categoryId = categoryId;
        }
        if (subcategoryId) {
             if (!mongoose.Types.ObjectId.isValid(subcategoryId)) {
                res.status(400).json({ message: 'Invalid subcategory ID format for update' });
                return;
            }
            const currentCategoryId = categoryId || product.categoryId;
            const parentSubcategory = await Subcategory.findOne({ _id: subcategoryId, categoryId: currentCategoryId });
            if (!parentSubcategory) {
                res.status(404).json({ message: 'Parent subcategory not found or does not belong to the product\'s category' });
                return;
            }
            product.subcategoryId = subcategoryId;
        }

        const newOriginalPrice = originalPrice !== undefined ? parseFloat(originalPrice) : product.originalPrice;
        const newDiscountPrice = discountPrice !== undefined ? (discountPrice === null ? null : parseFloat(discountPrice)) : product.discountPrice;

        // Calculate base prices from tax-inclusive prices
        const numTaxRate = 0.13; // Fixed 13% VAT rate for Nepal
        if (originalPrice !== undefined) {
            const basePrice = Math.round(newOriginalPrice / (1 + numTaxRate));
            product.basePrice = basePrice;
        }
        
        if (discountPrice !== undefined) {
            if (newDiscountPrice === null || newDiscountPrice === undefined) {
                product.discountBasePrice = undefined;
            } else {
                const discountBasePrice = Math.round(newDiscountPrice / (1 + numTaxRate));
                product.discountBasePrice = discountBasePrice;
            }
        }

        // Always set tax rate to 13% for Nepal
        product.taxRate = numTaxRate;


        if (newDiscountPrice !== null && newDiscountPrice !== undefined && newOriginalPrice !== undefined && newDiscountPrice >= newOriginalPrice) {
            res.status(400).json({ message: 'Discount price must be less than original price' });
            return;
        }

        // Update other fields
        if (title !== undefined) product.title = title;
        if (description !== undefined) product.description = description;
        if (shortDescription !== undefined) product.shortDescription = shortDescription; // Allows setting to null/empty
        if (originalPrice !== undefined) product.originalPrice = newOriginalPrice;
        // Handle discountPrice being set to null to remove it
      // Line 249 (fixed)
if (discountPrice !== undefined) { // If discountPrice was explicitly sent in the request body
 // Within this block, newDiscountPrice is derived from req.body.discountPrice.
 // It will be either a 'number' (from parseFloat) or 'null'.
 if (newDiscountPrice === null) {
 product.discountPrice = undefined; // Map null input to undefined to "remove" the discount
 } else {
 product.discountPrice = newDiscountPrice; // newDiscountPrice is a number here
}
 }
        if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
        if (features !== undefined) product.features = features;
        if (colors !== undefined) product.colors = colors;
        if (sizes !== undefined) product.sizes = sizes;
        if (brand !== undefined) product.brand = brand;
        if (seoKeywords !== undefined) product.seoKeywords = seoKeywords;
        if (tags !== undefined) product.tags = tags;
        if (returnPolicy !== undefined) product.returnPolicy = returnPolicy;
        if (warranty !== undefined) product.warranty = warranty;
        if (weight !== undefined) product.weight = weight;
        if (dimensions !== undefined) product.dimensions = dimensions;
        if (material !== undefined) product.material = material;
        if (customDetails !== undefined) product.customDetails = customDetails;
        if (status !== undefined) product.status = status;
        if (isCashOnDeliveryAvailable !== undefined) product.isCashOnDeliveryAvailable = isCashOnDeliveryAvailable;


        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error: any) {
        console.error('[Admin Product Controller] Update Product Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating product' });
        }
    }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid product ID format' });
            return;
        }
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }

        // Consider if associated reviews should also be deleted or handled
        // await Review.deleteMany({ productId: product._id });

        await product.deleteOne(); // Using deleteOne instead of remove
        res.json({ message: 'Product removed successfully' });
    } catch (error: any) {
        console.error('[Admin Product Controller] Delete Product Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting product' });
    }
};