import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { mutationLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema,
} from '../validators/doctorValidator.js';
import { mongoIdParamSchema } from '../validators/commonValidator.js';

const router = Router();

router
  .route('/')
  .get(validate(doctorQuerySchema, 'query'), getDoctors)
  .post(protect, authorize('admin'), mutationLimiter, validate(createDoctorSchema, 'body'), createDoctor);

router
  .route('/:id')
  .get(validate(mongoIdParamSchema, 'params'), getDoctorById)
  .put(
    protect,
    authorize('admin'),
    mutationLimiter,
    validate(mongoIdParamSchema, 'params'),
    validate(updateDoctorSchema, 'body'),
    updateDoctor
  )
  .delete(protect, authorize('admin'), mutationLimiter, validate(mongoIdParamSchema, 'params'), deleteDoctor);

export default router;
