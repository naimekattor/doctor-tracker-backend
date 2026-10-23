/**
 * Middleware factory for validating incoming requests using Zod schemas.
 * Compatible with Express 5 request getters.
 * @param {import('zod').ZodSchema} schema - Zod validation schema.
 * @param {'body' | 'query' | 'params'} [source='body'] - Request property to validate.
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);

      if (source === 'query' || source === 'params') {
        for (const key of Object.keys(req[source])) {
          delete req[source][key];
        }
        Object.assign(req[source], parsed);
      } else {
        req[source] = parsed;
      }

      next();
    } catch (error) {
      if (error.errors || error.issues) {
        const issues = error.errors || error.issues;
        const formattedErrors = issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      next(error);
    }
  };
};

export default validate;
