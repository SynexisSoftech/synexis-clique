import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware'; // Adjust path
import { HeroSlide } from '../../models/heroSlide.model'; // Adjust path
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from '../../services/cloudinary.service'; // Adjust path

/**
 * @desc    Create a new hero slide
 * @route   POST /api/admin/hero-slides
 * @access  Private/Admin
 */
export const createHeroSlide = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { title, subtitle, ctaText, ctaLink, order, status, seoKeywords, image } = req.body;

  if (!req.user) {
    res.status(401).json({ message: 'Not authorized, user not found' });
    return;
  }
  if (!image) {
    res.status(400).json({ message: 'An image is required for a hero slide.' });
    return;
  }

  try {
    let imageUrl: string;
    // Assuming 'image' is a base64 encoded string
    try {
      imageUrl = await uploadImageToCloudinary(image, 'hero_slides');
    } catch (uploadError: any) {
      console.error('[Admin Hero Controller] Cloudinary Upload Error:', uploadError.message);
      res.status(500).json({ message: 'Image upload failed. Please try again.' });
      return;
    }

    const heroSlide = new HeroSlide({
      title,
      subtitle,
      imageUrl,
      ctaText,
      ctaLink,
      order,
      status,
      seoKeywords,
      createdBy: req.user._id,
    });

    const createdSlide = await heroSlide.save();
    res.status(201).json(createdSlide);
  } catch (error: any) {
    console.error('[Admin Hero Controller] Create Slide Error:', error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Server error while creating hero slide' });
    }
  }
};

/**
 * @desc    Get all hero slides
 * @route   GET /api/admin/hero-slides
 * @access  Private/Admin
 */
export const getAllHeroSlides = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;
        const statusFilter = req.query.status as string;

        const query: any = {};
        if (statusFilter && ['active', 'inactive'].includes(statusFilter)) {
            query.status = statusFilter;
        }

        const count = await HeroSlide.countDocuments(query);
        const slides = await HeroSlide.find(query)
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('createdBy', 'username email')
            .sort({ order: 1, createdAt: -1 }); // Sort by order, then by creation date

        res.json({
            slides,
            page,
            pages: Math.ceil(count / pageSize),
            count
        });
    } catch (error: any) {
        console.error('[Admin Hero Controller] Get All Slides Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching hero slides' });
    }
};

/**
 * @desc    Get a single hero slide by ID
 * @route   GET /api/admin/hero-slides/:id
 * @access  Private/Admin
 */
export const getHeroSlideById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid slide ID format' });
            return;
        }
        const slide = await HeroSlide.findById(req.params.id).populate('createdBy', 'username email');
        if (slide) {
            res.json(slide);
        } else {
            res.status(404).json({ message: 'Hero slide not found' });
        }
    } catch (error: any) {
        console.error('[Admin Hero Controller] Get Slide By ID Error:', error.message);
        res.status(500).json({ message: 'Server error while fetching hero slide' });
    }
};


/**
 * @desc    Update a hero slide
 * @route   PUT /api/admin/hero-slides/:id
 * @access  Private/Admin
 */
export const updateHeroSlide = async (req: AuthRequest, res: Response): Promise<void> => {
    const { title, subtitle, ctaText, ctaLink, order, status, seoKeywords, image } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid slide ID format' });
            return;
        }

        const slide = await HeroSlide.findById(req.params.id);

        if (!slide) {
            res.status(404).json({ message: 'Hero slide not found' });
            return;
        }

        let newImageUrl = slide.imageUrl;
        if (image && typeof image === 'string' && !image.startsWith('http')) {
            try {
                // You might want to delete the old image from Cloudinary here
                newImageUrl = await uploadImageToCloudinary(image, 'hero_slides');
            } catch (uploadError: any) {
                console.error('[Admin Hero Controller] Cloudinary Upload Error on Update:', uploadError.message);
                res.status(500).json({ message: 'Image upload failed during update.' });
                return;
            }
        }

        slide.title = title ?? slide.title;
        slide.subtitle = subtitle ?? slide.subtitle;
        slide.ctaText = ctaText ?? slide.ctaText;
        slide.ctaLink = ctaLink ?? slide.ctaLink;
        slide.order = order ?? slide.order;
        slide.status = status ?? slide.status;
        slide.seoKeywords = seoKeywords ?? slide.seoKeywords;
        slide.imageUrl = newImageUrl;

        const updatedSlide = await slide.save();
        res.json(updatedSlide);

    } catch (error: any) {
        console.error('[Admin Hero Controller] Update Slide Error:', error.message);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', errors: error.errors });
        } else {
            res.status(500).json({ message: 'Server error while updating hero slide' });
        }
    }
};

/**
 * @desc    Delete a hero slide
 * @route   DELETE /api/admin/hero-slides/:id
 * @access  Private/Admin
 */
export const deleteHeroSlide = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Invalid slide ID format' });
            return;
        }
        const slide = await HeroSlide.findById(req.params.id);

        if (!slide) {
            res.status(404).json({ message: 'Hero slide not found' });
            return;
        }
        
        // Optional: Delete image from Cloudinary before deleting the document.
        // You would need a function to extract the public_id from the imageUrl.
        // e.g., if (slide.imageUrl) { await deleteImageFromCloudinary(slide.imageUrl); }

        await slide.deleteOne();
        res.json({ message: 'Hero slide removed successfully' });
    } catch (error: any) {
        console.error('[Admin Hero Controller] Delete Slide Error:', error.message);
        res.status(500).json({ message: 'Server error while deleting hero slide' });
    }
};