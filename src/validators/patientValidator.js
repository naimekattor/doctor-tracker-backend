import { z } from 'zod';

export const CANONICAL_CONDITIONS = [
  'Stable',
  'Critical',
  'Under Observation',
  'Recovered',
  'Chronic',
  'Routine Checkup',
];

export const createPatientSchema = z
  .object({
    name: z
      .string({ required_error: 'Patient name is required' })
      .trim()
      .min(2, 'Patient name must be at least 2 characters long')
      .max(100, 'Patient name cannot exceed 100 characters'),
    age: z.coerce
      .number({ required_error: 'Age is required' })
      .int('Age must be an integer')
      .min(0, 'Age cannot be negative')
      .max(130, 'Age must be valid'),
    gender: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Gender is required (Male, Female, or Other)',
    }),
    condition: z.enum(
      ['Stable', 'Critical', 'Under Observation', 'Recovered', 'Chronic', 'Routine Checkup'],
      { required_error: 'Patient condition is required (Stable, Critical, Under Observation, Recovered, Chronic, or Routine Checkup)' }
    ),
    contactPhone: z
      .string({ required_error: 'Contact phone is required' })
      .trim()
      .min(4, 'Valid contact phone is required')
      .max(30, 'Contact phone cannot exceed 30 characters'),
    doctor: z
      .string({ required_error: 'Doctor reference is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid doctor ID format: must be 24-character hex ObjectId'),
  })
  .strict();

export const updatePatientSchema = createPatientSchema.partial();

export const patientQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    doctor: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid doctor ID in query filter')
      .optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    condition: z.string().trim().max(120).optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    sort: z
      .enum(['createdAt', '-createdAt', 'name', '-name', 'age', '-age'])
      .default('-createdAt'),
  })
  .strict();

export default {
  createPatientSchema,
  updatePatientSchema,
  patientQuerySchema,
  CANONICAL_CONDITIONS,
};

