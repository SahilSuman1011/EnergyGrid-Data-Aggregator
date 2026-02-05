// HTTP client for making authenticated API requests
const axios = require('axios');
const SignatureGenerator = require('../utils/signatureGenerator');
const Logger = require('../utils/logger');
const { API_BASE_URL, API_ENDPOINT, API_TOKEN } = require('../config/constants');

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.endpoint = API_ENDPOINT;
    this.token = API_TOKEN;
    this.fullUrl = `${this.baseUrl}${this.endpoint}`;
  }

  /**
   * Fetch device data for a batch of serial numbers
   * 
   * @param {Array<string>} serialNumbers - Array of device serial numbers
   * @returns {Promise<Array>} Device data array
   * @throws {Error} If request fails
   */
  async fetchDeviceData(serialNumbers) {
    // Generate signature and timestamp
    const { signature, timestamp } = SignatureGenerator.generateWithTimestamp(
      this.endpoint,
      this.token
    );

    try {
      const response = await axios.post(
        this.fullUrl,
        {
          sn_list: serialNumbers
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'signature': signature,
            'timestamp': timestamp
          },
          timeout: 5000 // 5 second timeout
        }
      );

      return response.data.data;
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.error || 'Unknown error';
        
        throw new Error(`API Error [${status}]: ${message}`);
      } else if (error.request) {
        // Request made but no response
        throw new Error('No response from server. Is the mock API running?');
      } else {
        // Something else went wrong
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  /**
   * Test connection to the API
   * 
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await this.fetchDeviceData(['SN-000']);
      Logger.success('API connection test successful');
      return true;
    } catch (error) {
      Logger.error(`API connection test failed: ${error.message}`);
      return false;
    }
  }
}

module.exports = ApiClient;