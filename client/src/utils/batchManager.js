// Utility to split large arrays into smaller batches

class BatchManager {
  /**
   * Split an array into chunks of specified size
   * 
   * @param {Array} array - The array to split
   * @param {number} batchSize - Size of each batch
   * @returns {Array<Array>} Array of batches
   */
  static createBatches(array, batchSize) {
    const batches = [];
    
    for (let i = 0; i < array.length; i += batchSize) {
      const batch = array.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    return batches;
  }

  /**
   * Generate serial numbers for devices
   * 
   * @param {number} count - Total number of devices
   * @param {string} prefix - Prefix for serial numbers (default: 'SN-')
   * @returns {Array<string>} Array of serial numbers
   */
  static generateSerialNumbers(count, prefix = 'SN-') {
    const serialNumbers = [];
    
    for (let i = 0; i < count; i++) {
      // Pad with zeros (e.g., SN-000, SN-001, ..., SN-499)
      const paddedNumber = i.toString().padStart(3, '0');
      serialNumbers.push(`${prefix}${paddedNumber}`);
    }
    
    return serialNumbers;
  }
}

module.exports = BatchManager;