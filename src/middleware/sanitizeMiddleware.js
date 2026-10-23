/**
 * Recursive check for NoSQL injection characters in keys ($ and .)
 * and dangerous operator structures.
 * @param {any} value
 * @returns {boolean} True if malicious operator/key detected
 */
const hasNoSQLInjection = (value) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Array.isArray(value)) {
    return value.some(hasNoSQLInjection);
  }

  for (const key of Object.keys(value)) {
    // Prohibit keys starting with $ (MongoDB query/update operators)
    // and keys containing dot notation for unauthorized nested object traversals
    if (key.startsWith('$') || key.includes('.')) {
      return true;
    }

    if (hasNoSQLInjection(value[key])) {
      return true;
    }
  }

  return false;
};

/**
 * Express middleware to detect and reject NoSQL operator injection
 * in body, query, and params.
 */
export const nosqlSanitizer = (req, res, next) => {
  if (hasNoSQLInjection(req.body)) {
    return res.status(400).json({
      success: false,
      message: 'Security validation failed: Request body contains prohibited query operators ($ or .)',
    });
  }

  if (hasNoSQLInjection(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Security validation failed: Query parameters contain prohibited query operators ($ or .)',
    });
  }

  if (hasNoSQLInjection(req.params)) {
    return res.status(400).json({
      success: false,
      message: 'Security validation failed: URL parameters contain prohibited query operators ($ or .)',
    });
  }

  next();
};

export default nosqlSanitizer;
