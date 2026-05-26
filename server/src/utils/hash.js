const crypto = require('crypto');

/**
 * Hash mnemonic words for secure storage
 * Sorts words before hashing so order doesn't affect login
 * @param {string[]} words
 * @returns {string}
 */
function hashMnemonic(words) {
  const sorted = [...words].sort().join(' ');
  return crypto.createHash('sha256').update(sorted).digest('hex');
}

module.exports = { hashMnemonic };
