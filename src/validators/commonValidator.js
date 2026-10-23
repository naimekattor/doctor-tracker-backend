import { z } from 'zod';

/**
 * Validates standard 24-character hexadecimal MongoDB ObjectId in route params
 */
export const mongoIdParamSchema = z
  .object({
    id: z
      .string({ required_error: 'ID parameter is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format: must be a 24-character hexadecimal ObjectId'),
  })
  .strict();

export default {
  mongoIdParamSchema,
};
