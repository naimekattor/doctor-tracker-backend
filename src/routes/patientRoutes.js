import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../controllers/patientController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { mutationLimiter } from '../middleware/rateLimitMiddleware.js';
import {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
} from '../validators/patientValidator.js';
import { mongoIdParamSchema } from '../validators/commonValidator.js';

const router = Router();

router
  .route('/')
  .get(validate(patientQuerySchema, 'query'), getPatients)
  .post(protect, authorize('admin'), mutationLimiter, validate(createPatientSchema, 'body'), createPatient);

router
  .route('/:id')
  .get(validate(mongoIdParamSchema, 'params'), getPatientById)
  .put(
    protect,
    authorize('admin'),
    mutationLimiter,
    validate(mongoIdParamSchema, 'params'),
    validate(updatePatientSchema, 'body'),
    updatePatient
  )
  .delete(protect, authorize('admin'), mutationLimiter, validate(mongoIdParamSchema, 'params'), deletePatient);

export default router;
