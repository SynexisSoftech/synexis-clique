import { Request, Response, NextFunction } from 'express';
import { Province } from '../../models/shipping.model';

/**
 * @desc    Get all provinces with active cities for checkout
 * @route   GET /api/shipping/provinces
 * @access  Public
 */
export const getProvincesForCheckout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provinces = await Province.find({ isActive: true })
      .select('name cities.name cities.shippingCharge cities.isActive')
      .sort({ name: 1 });
    
    // Filter only active cities
    const provincesWithActiveCities = provinces.map(province => ({
      _id: province._id,
      name: province.name,
      cities: province.cities.filter(city => city.isActive)
    }));

    res.status(200).json({
      success: true,
      count: provincesWithActiveCities.length,
      data: provincesWithActiveCities
    });
  } catch (error: any) {
    console.error('[Public Shipping Controller] Get Provinces Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching provinces' 
    });
  }
};

/**
 * @desc    Get shipping charge for a specific city
 * @route   GET /api/shipping/city/:cityName
 * @access  Public
 */
export const getShippingChargeByCity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { cityName } = req.params;

    const province = await Province.findOne({
      'cities.name': { $regex: new RegExp(cityName, 'i') },
      'cities.isActive': true
    });

    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'City not found or not available for shipping' 
      });
      return;
    }

    const city = province.cities.find(c => 
      c.name.toLowerCase() === cityName.toLowerCase() && c.isActive
    );

    if (!city) {
      res.status(404).json({ 
        success: false, 
        message: 'City not found or not available for shipping' 
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        province: province.name,
        city: city.name,
        shippingCharge: city.shippingCharge
      }
    });
  } catch (error: any) {
    console.error('[Public Shipping Controller] Get Shipping Charge Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching shipping charge' 
    });
  }
};

/**
 * @desc    Get cities by province
 * @route   GET /api/shipping/provinces/:provinceName/cities
 * @access  Public
 */
export const getCitiesByProvince = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provinceName } = req.params;

    const province = await Province.findOne({
      name: provinceName,
      isActive: true
    });

    if (!province) {
      res.status(404).json({ 
        success: false, 
        message: 'Province not found' 
      });
      return;
    }

    const activeCities = province.cities.filter(city => city.isActive);

    res.status(200).json({
      success: true,
      data: {
        province: province.name,
        cities: activeCities.map(city => ({
          name: city.name,
          shippingCharge: city.shippingCharge
        }))
      }
    });
  } catch (error: any) {
    console.error('[Public Shipping Controller] Get Cities Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching cities' 
    });
  }
}; 