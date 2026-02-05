#!/usr/bin/env node

/**
 * EnergyGrid Data Aggregator
 * 
 * Client application to fetch real-time telemetry from 500 solar inverters
 * while respecting strict rate limits and security protocols.
 * 
 * Features:
 * - Rate limiting: 1 request per second
 * - Batching: 10 devices per request
 * - Security: MD5 signature authentication
 * - Error handling: Automatic retries with exponential backoff
 * - Progress tracking: Real-time console updates
 */

const DataAggregator = require('./core/aggregator');

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n\nReceived SIGINT. Shutting down gracefully...');
  process.exit(0);
});

// Main execution
(async () => {
  const aggregator = new DataAggregator();
  await aggregator.run();
})();