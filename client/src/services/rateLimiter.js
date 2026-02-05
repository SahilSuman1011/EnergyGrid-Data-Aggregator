// Rate limiter to ensure exactly 1 request per second
const Logger = require('../utils/logger');

class RateLimiter {
  constructor(intervalMs = 1000) {
    this.intervalMs = intervalMs;
    this.queue = [];
    this.isProcessing = false;
    this.lastRequestTime = 0;
  }

  /**
   * Calculate delay needed to maintain rate limit
   * 
   * @returns {number} Delay in milliseconds
   */
  _calculateDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest >= this.intervalMs) {
      return 0; // No delay needed
    }
    
    return this.intervalMs - timeSinceLastRequest;
  }

  /**
   * Sleep for specified milliseconds
   * 
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process the request queue
   */
  async _processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const { task, resolve, reject } = this.queue.shift();
      
      // Calculate and apply delay
      const delay = this._calculateDelay();
      if (delay > 0) {
        await this._sleep(delay);
      }

      try {
        // Execute the task
        this.lastRequestTime = Date.now();
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Schedule a task to run with rate limiting
   * 
   * @param {Function} task - Async function to execute
   * @returns {Promise<any>} Result of the task
   */
  schedule(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._processQueue();
    });
  }

  /**
   * Execute multiple tasks with rate limiting
   * 
   * @param {Array<Function>} tasks - Array of async functions
   * @param {Function} onProgress - Progress callback (current, total)
   * @returns {Promise<Array>} Results of all tasks
   */
  async executeAll(tasks, onProgress = null) {
    const results = [];
    
    for (let i = 0; i < tasks.length; i++) {
      const result = await this.schedule(tasks[i]);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, tasks.length);
      }
    }
    
    return results;
  }

  /**
   * Get queue status
   * 
   * @returns {Object} Queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
      intervalMs: this.intervalMs
    };
  }
}

module.exports = RateLimiter;