// Configuration constants for the EnergyGrid API client

module.exports = {
  // API Configuration
  API_BASE_URL: 'http://localhost:3000',
  API_ENDPOINT: '/device/real/query',
  API_TOKEN: 'interview_token_123',

  // Device Configuration
  TOTAL_DEVICES: 500,
  DEVICE_SN_PREFIX: 'SN-',

  // Rate Limiting Configuration
  BATCH_SIZE: 10,              // Max devices per request
  REQUEST_INTERVAL_MS: 1000,   // 1 request per second (1000ms)

  // Retry Configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 2000,        // Wait 2s before retry

  // Output Configuration
  OUTPUT_FILE: './results/aggregated_data.json'
};