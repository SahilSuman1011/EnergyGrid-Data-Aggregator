// Cryptographic signature generator for API authentication
const crypto = require('crypto');

class SignatureGenerator {
  /**
   * Generate MD5 signature for API request
   * Formula: MD5(URL + Token + Timestamp)
   * 
   * @param {string} url - The API endpoint URL
   * @param {string} token - Secret token
   * @param {string} timestamp - Current timestamp in milliseconds
   * @returns {string} MD5 hash signature
   */
  static generate(url, token, timestamp) {
    const payload = url + token + timestamp;
    const signature = crypto
      .createHash('md5')
      .update(payload)
      .digest('hex');
    
    return signature;
  }

  /**
   * Generate signature with current timestamp
   * @param {string} url - The API endpoint URL
   * @param {string} token - Secret token
   * @returns {Object} Object containing signature and timestamp
   */
  static generateWithTimestamp(url, token) {
    const timestamp = Date.now().toString();
    const signature = this.generate(url, token, timestamp);
    
    return {
      signature,
      timestamp
    };
  }
}

module.exports = SignatureGenerator;