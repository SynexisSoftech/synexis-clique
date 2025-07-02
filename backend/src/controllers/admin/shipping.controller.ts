import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { Province, IProvince, ICity } from '../../models/shipping.model';
import mongoose from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';

/**
 * @desc    Get all provinces with their cities
 * @route   GET /api/admin/shipping/provinces
 * @access  Private (Admin)
 */
export const getAllProvinces = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provinces = await Province.find({ isActive: true }).sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: provinces.length,
      data: provinces
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Get All Provinces Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching provinces' 
    });
  }
});

/**
 * @desc    Get single province with cities
 * @route   GET /api/admin/shipping/provinces/:id
 * @access  Private (Admin)
 */
export const getProvinceById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const province = await Province.findById(req.params.id);
    
    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: province
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Get Province Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching province' 
    });
  }
});

/**
 * @desc    Create new province
 * @route   POST /api/admin/shipping/provinces
 * @access  Private (Admin)
 */
export const createProvince = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;

    // Check if province already exists
    const existingProvince = await Province.findOne({ name });
    if (existingProvince) {
      res.status(400).json({ 
        success: false, 
        message: 'Province already exists' 
      });
      return;
    }

    const province = await Province.create({ name });

    res.status(201).json({
      success: true,
      message: 'Province created successfully',
      data: province
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Create Province Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating province' 
    });
  }
});

/**
 * @desc    Add city to province
 * @route   POST /api/admin/shipping/provinces/:provinceId/cities
 * @access  Private (Admin)
 */
export const addCityToProvince = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, shippingCharge } = req.body;
    const { provinceId } = req.params;

    const province = await Province.findById(provinceId);
    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    // Check if city already exists in this province
    const existingCity = province.cities.find(city => city.name.toLowerCase() === name.toLowerCase());
    if (existingCity) {
      res.status(400).json({ 
        success: false, 
        message: 'City already exists in this province' 
      });
      return;
    }

    // Add new city
    province.cities.push({
      name: name,
      shippingCharge: Number(shippingCharge),
      isActive: true
    } as any);

    await province.save();

    res.status(201).json({
      success: true,
      message: 'City added successfully',
      data: province
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Add City Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding city' 
    });
  }
});

/**
 * @desc    Update city shipping charge
 * @route   PUT /api/admin/shipping/provinces/:provinceId/cities/:cityId
 * @access  Private (Admin)
 */
export const updateCityShippingCharge = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shippingCharge, isActive } = req.body;
    const { provinceId, cityId } = req.params;

    const province = await Province.findById(provinceId);
    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    // Try to find city by _id first, then by name as fallback
    let cityIndex = province.cities.findIndex(city => city._id?.toString() === cityId);
    
    // If not found by _id, try to find by name (for backward compatibility)
    if (cityIndex === -1) {
      cityIndex = province.cities.findIndex(city => city.name === cityId);
    }

    if (cityIndex === -1) {
      res.status(404).json({ 
        success: false, 
        message: 'City not found' 
      });
      return;
    }

    // Update city
    if (shippingCharge !== undefined) {
      province.cities[cityIndex].shippingCharge = Number(shippingCharge);
    }
    if (isActive !== undefined) {
      province.cities[cityIndex].isActive = isActive;
    }

    await province.save();

    res.status(200).json({
      success: true,
      message: 'City updated successfully',
      data: province
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Update City Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating city' 
    });
  }
});

/**
 * @desc    Delete city from province
 * @route   DELETE /api/admin/shipping/provinces/:provinceId/cities/:cityId
 * @access  Private (Admin)
 */
export const deleteCityFromProvince = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provinceId, cityId } = req.params;
    
    console.log('[Shipping Controller] Delete City Request:', { provinceId, cityId });

    const province = await Province.findById(provinceId);
    if (!province) {
      console.log('[Shipping Controller] Province not found:', provinceId);
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    console.log('[Shipping Controller] Found province:', province.name);
    console.log('[Shipping Controller] Cities in province:', province.cities.map(c => ({ id: c._id, name: c.name })));

    // Try to find city by _id first, then by name as fallback
    let cityIndex = province.cities.findIndex(city => city._id?.toString() === cityId);
    
    // If not found by _id, try to find by name (for backward compatibility)
    if (cityIndex === -1) {
      cityIndex = province.cities.findIndex(city => city.name === cityId);
    }
    
    console.log('[Shipping Controller] City index found:', cityIndex);
    
    if (cityIndex === -1) {
      console.log('[Shipping Controller] City not found:', cityId);
      res.status(404).json({ 
        success: false, 
        message: 'City not found' 
      });
      return;
    }

    // Remove city
    const deletedCity = province.cities[cityIndex];
    province.cities.splice(cityIndex, 1);
    await province.save();

    console.log('[Shipping Controller] City deleted successfully:', deletedCity.name);

    res.status(200).json({
      success: true,
      message: 'City deleted successfully',
      data: province
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Delete City Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting city' 
    });
  }
});

/**
 * @desc    Update province name
 * @route   PUT /api/admin/shipping/provinces/:id
 * @access  Private (Admin)
 */
export const updateProvince = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const province = await Province.findById(id);
    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    // Check if the new name already exists (excluding current province)
    const existingProvince = await Province.findOne({ name, _id: { $ne: id } });
    if (existingProvince) {
      res.status(400).json({ 
        success: false, 
        message: 'Province name already exists' 
      });
      return;
    }

    province.name = name;
    await province.save();

    res.status(200).json({
      success: true,
      message: 'Province updated successfully',
      data: province
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Update Province Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating province' 
    });
  }
});

/**
 * @desc    Delete province
 * @route   DELETE /api/admin/shipping/provinces/:id
 * @access  Private (Admin)
 */
export const deleteProvince = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const province = await Province.findById(id);
    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    // Check if province has cities
    if (province.cities.length > 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Cannot delete province with existing cities. Please delete all cities first.' 
      });
      return;
    }

    await Province.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Province deleted successfully'
    });
  } catch (error: any) {
    console.error('[Shipping Controller] Delete Province Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting province' 
    });
  }
}); 