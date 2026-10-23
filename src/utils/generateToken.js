import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token for authenticated users.
 * @param {string|Object} payload - User ID or object to sign.
 * @param {string} [expiresIn='7d'] - Expiration time.
 * @returns {string} - JWT signed token.
 */
export const generateToken = (payload, expiresIn = '7d') => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const tokenPayload =
    typeof payload === 'object' && !(payload instanceof Object && '_bsontype' in payload) && 'id' in payload
      ? payload
      : { id: String(payload?._id || payload?.id || payload) };
  return jwt.sign(tokenPayload, secret, { expiresIn });
};

export default generateToken;
