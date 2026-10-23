import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password.
 * @param {string} password - The plain password.
 * @returns {Promise<string>} - Hashed password string.
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with hashed password.
 * @param {string} password - The plain password.
 * @param {string} hashedPassword - The hashed password stored in database.
 * @returns {Promise<boolean>} - True if match, false otherwise.
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

export default {
  hashPassword,
  comparePassword,
};
