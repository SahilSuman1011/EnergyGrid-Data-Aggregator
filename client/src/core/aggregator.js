// Main orchestrator for fetching and aggregating device data
const fs = require('fs').promises;
const path = require('path');
const ApiClient = require('../services/apiClient');
const RateLimiter = require('../services/rateLimiter');
const BatchManager = require('../utils/batchManager');
const Logger = require('../utils/logger');
const {
  TOTAL_DEVICES,
  DEVICE_SN_PREFIX,
  BATCH_SIZE,
  REQUEST_INTERVAL_MS,
  MAX_RETRIES,
  RETRY_DELAY_MS,
  OUTPUT_FILE
} = require('../config/constants');

class DataAggregator {
  constructor() {
    this.apiClient = new ApiClient();
    this.rateLimiter = new RateLimiter(REQUEST_INTERVAL_MS);
    this.results = [];
    this.errors = [];
  }

  /**
   * Generate all serial numbers
   * 
   * @returns {Array<string>} Array of serial numbers
   */
  generateSerialNumbers() {
    Logger.info(`Generating ${TOTAL_DEVICES} serial numbers...`);
    const serialNumbers = BatchManager.generateSerialNumbers(
      TOTAL_DEVICES,
      DEVICE_SN_PREFIX
    );
    Logger.success(`Generated ${serialNumbers.length} serial numbers (${serialNumbers[0]} to ${serialNumbers[serialNumbers.length - 1]})`);
    return serialNumbers;
  }

  /**
   * Create batches from serial numbers
   * 
   * @param {Array<string>} serialNumbers - All serial numbers
   * @returns {Array<Array<string>>} Array of batches
   */
  createBatches(serialNumbers) {
    Logger.info(`Creating batches of ${BATCH_SIZE}...`);
    const batches = BatchManager.createBatches(serialNumbers, BATCH_SIZE);
    Logger.success(`Created ${batches.length} batches`);
    return batches;
  }

  /**
   * Fetch data for a single batch with retry logic
   * 
   * @param {Array<string>} batch - Batch of serial numbers
   * @param {number} batchIndex - Index of the batch
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<Array>} Device data
   */
  async fetchBatchWithRetry(batch, batchIndex, retryCount = 0) {
    try {
      const data = await this.apiClient.fetchDeviceData(batch);
      return data;
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        Logger.warning(
          `Batch ${batchIndex + 1} failed: ${error.message}. Retrying (${retryCount + 1}/${MAX_RETRIES})...`
        );
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        
        return this.fetchBatchWithRetry(batch, batchIndex, retryCount + 1);
      } else {
        // Max retries reached
        Logger.error(`Batch ${batchIndex + 1} failed after ${MAX_RETRIES} retries: ${error.message}`);
        this.errors.push({
          batch: batchIndex + 1,
          serialNumbers: batch,
          error: error.message
        });
        return [];
      }
    }
  }

  /**
   * Fetch data for all batches
   * 
   * @param {Array<Array<string>>} batches - All batches
   * @returns {Promise<Array>} All device data
   */
  async fetchAllData(batches) {
    Logger.info(`Starting to fetch data for ${batches.length} batches...`);
    Logger.info(`Estimated time: ~${batches.length} seconds (1 request/second)`);
    
    const startTime = Date.now();
    
    // Create tasks for each batch
    const tasks = batches.map((batch, index) => {
      return async () => {
        return this.fetchBatchWithRetry(batch, index);
      };
    });

    // Execute all tasks with rate limiting and progress tracking
    const batchResults = await this.rateLimiter.executeAll(
      tasks,
      (current, total) => {
        Logger.progress(current, total, `Processing batch ${current}/${total}`);
      }
    );

    // Flatten results
    const allData = batchResults.flat();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    Logger.success(`\nFetched data for ${allData.length} devices in ${duration}s`);
    
    return allData;
  }

  /**
   * Save aggregated data to file
   * 
   * @param {Array} data - Aggregated device data
   * @returns {Promise<void>}
   */
  async saveResults(data) {
    try {
      // Ensure results directory exists
      const outputDir = path.dirname(OUTPUT_FILE);
      await fs.mkdir(outputDir, { recursive: true });

      // Create summary
      const summary = {
        totalDevices: TOTAL_DEVICES,
        successfulFetches: data.length,
        failedFetches: this.errors.length,
        timestamp: new Date().toISOString(),
        data: data,
        errors: this.errors
      };

      // Write to file
      await fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify(summary, null, 2),
        'utf8'
      );

      Logger.success(`Results saved to ${OUTPUT_FILE}`);
    } catch (error) {
      Logger.error(`Failed to save results: ${error.message}`);
    }
  }

  /**
   * Display summary statistics
   * 
   * @param {Array} data - Aggregated device data
   */
  displaySummary(data) {
    console.log('\n' + '='.repeat(60));
    console.log('AGGREGATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Devices:        ${TOTAL_DEVICES}`);
    console.log(`Successfully Fetched: ${data.length}`);
    console.log(`Failed:               ${this.errors.length}`);
    console.log(`Success Rate:         ${((data.length / TOTAL_DEVICES) * 100).toFixed(2)}%`);
    
    if (data.length > 0) {
      const onlineDevices = data.filter(d => d.status === 'Online').length;
      const offlineDevices = data.filter(d => d.status === 'Offline').length;
      
      console.log(`\nDevice Status:`);
      console.log(`  Online:  ${onlineDevices} (${((onlineDevices / data.length) * 100).toFixed(1)}%)`);
      console.log(`  Offline: ${offlineDevices} (${((offlineDevices / data.length) * 100).toFixed(1)}%)`);
      
      const totalPower = data.reduce((sum, d) => {
        return sum + parseFloat(d.power);
      }, 0);
      console.log(`\nTotal Power Output: ${totalPower.toFixed(2)} kW`);
    }
    
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Main execution method
   */
  async run() {
    try {
      Logger.info('Starting EnergyGrid Data Aggregator\n');

      // Step 1: Test API connection
      Logger.info('Testing API connection...');
      const isConnected = await this.apiClient.testConnection();
      if (!isConnected) {
        throw new Error('Cannot connect to API. Please ensure the mock server is running.');
      }
      console.log();

      // Step 2: Generate serial numbers
      const serialNumbers = this.generateSerialNumbers();
      console.log();

      // Step 3: Create batches
      const batches = this.createBatches(serialNumbers);
      console.log();

      // Step 4: Fetch all data
      const data = await this.fetchAllData(batches);
      this.results = data;

      // Step 5: Save results
      await this.saveResults(data);
      console.log();

      // Step 6: Display summary
      this.displaySummary(data);

      Logger.success('Data aggregation completed successfully!');
      
    } catch (error) {
      Logger.error(`\nFatal error: ${error.message}`);
      process.exit(1);
    }
  }
}

module.exports = DataAggregator;