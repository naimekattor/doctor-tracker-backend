/**
 * Escapes special regex characters in a string to prevent ReDoS
 * and unwanted pattern evaluation.
 * @param {string} str - Raw input string
 * @returns {string} Escaped string safe for new RegExp() or MongoDB $regex
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default {
  escapeRegex,
};
