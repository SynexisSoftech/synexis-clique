import express from 'express';
import {
  getProvincesForCheckout,
  getShippingChargeByCity,
  getCitiesByProvince
} from '../../controllers/public/shipping.controller';

const router = express.Router();

// Public routes for checkout
router.get('/provinces', getProvincesForCheckout);
router.get('/city/:cityName', getShippingChargeByCity);
router.get('/provinces/:provinceName/cities', getCitiesByProvince);

export default router; 