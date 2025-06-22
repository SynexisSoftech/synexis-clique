import express from 'express';
import {
  getAllProvinces,
  getProvinceById,
  createProvince,
  addCityToProvince,
  updateCityShippingCharge,
  deleteCityFromProvince,
  updateProvince,
  deleteProvince
} from '../../controllers/admin/shipping.controller';
import { protect, authorize } from '../../middleware/auth.middleware';
import { UserRole } from '../../models/user.model';

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize([UserRole.ADMIN]));

// Province routes
router.route('/provinces')
  .get(getAllProvinces)
  .post(createProvince);

router.route('/provinces/:id')
  .get(getProvinceById)
  .put(updateProvince)
  .delete(deleteProvince);

// City routes
router.route('/provinces/:provinceId/cities')
  .post(addCityToProvince);

router.route('/provinces/:provinceId/cities/:cityId')
  .put(updateCityShippingCharge)
  .delete(deleteCityFromProvince);

export default router; 