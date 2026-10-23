import { z } from 'zod';

export const createDoctorSchema = z
  .object({
    name: z
      .string({ required_error: 'Doctor name is required' })
      .trim()
      .min(2, 'Doctor name must be at least 2 characters long')
      .max(100, 'Doctor name cannot exceed 100 characters'),
    specialization: z
      .string({ required_error: 'Specialization is required' })
      .trim()
      .min(2, 'Specialization is required')
      .max(100, 'Specialization cannot exceed 100 characters'),
    hospital: z
      .string({ required_error: 'Hospital is required' })
      .trim()
      .min(2, 'Hospital is required')
      .max(120, 'Hospital cannot exceed 120 characters'),
    phone: z
      .string({ required_error: 'Phone number is required' })
      .trim()
      .min(4, 'Valid phone number is required')
      .max(30, 'Phone number cannot exceed 30 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .toLowerCase()
      .max(100, 'Email cannot exceed 100 characters'),
  })
  .strict();

export const updateDoctorSchema = createDoctorSchema.partial();

export const doctorQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(100).optional(),
    specialization: z.string().trim().max(100).optional(),
    hospital: z.string().trim().max(120).optional(),
    startDate: z.string().trim().optional(),
    endDate: z.string().trim().optional(),
    sort: z
      .enum([
        'createdAt',
        '-createdAt',
        'name',
        '-name',
        'specialization',
        '-specialization',
        'hospital',
        '-hospital',
      ])
      .default('-createdAt'),
  })
  .strict();

export default {
  createDoctorSchema,
  updateDoctorSchema,
  doctorQuerySchema,
};
