import rateLimit from 'express-rate-limit';

/**
 * Standard factory for rate limit response format
 */
const createLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message,
    retryAfter: res.getHeader('Retry-After') || 'Please try again later',
  });
};

/**
 * Client IP resolver supporting reverse proxies and test harness simulation
 */
const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
};

/**
 * Strict rate limiter for Authentication endpoints (Login & Register)
 * Limits brute-force credential stuffing and password guessing.
 * 5 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { keyGeneratorIpFallback: false },
  message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  handler: createLimitHandler('Too many authentication attempts from this IP. Please try again after 15 minutes.'),
});

/**
 * Moderate rate limiter for Analytics endpoints
 * Protects computationally heavy aggregation pipelines ($group, $lookup, $unwind).
 * 30 requests per minute per IP.
 */
export const analyticsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { keyGeneratorIpFallback: false },
  message: 'Too many analytics requests. Please wait a minute before requesting fresh metrics.',
  handler: createLimitHandler('Too many analytics requests. Please wait a minute before requesting fresh metrics.'),
});

/**
 * Moderate rate limiter for Data Mutations (Create, Update, Delete)
 * Limits spam creation and rapid database updates.
 * 60 requests per minute per IP.
 */
export const mutationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { keyGeneratorIpFallback: false },
  message: 'Write rate limit exceeded. Please throttle resource creation and modifications.',
  handler: createLimitHandler('Write rate limit exceeded. Please throttle resource creation and modifications.'),
});

/**
 * Global baseline API rate limiter
 * Protects general endpoints from unbounded resource consumption.
 * 200 requests per minute per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIp,
  validate: { keyGeneratorIpFallback: false },
  message: 'API rate limit exceeded. Please slow down your requests.',
  handler: createLimitHandler('API rate limit exceeded. Please slow down your requests.'),
});

export default {
  authLimiter,
  analyticsLimiter,
  mutationLimiter,
  globalLimiter,
};
