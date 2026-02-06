# EnergyGrid Data Aggregator - Client

A robust Node.js client application to fetch real-time telemetry data from 500 solar inverters while navigating strict API rate limits and security protocols.

## 📋 Overview

This application fetches telemetry data for 500 solar inverter devices from a legacy EnergyGrid API that enforces:

- **Rate Limit:** 1 request per second (strict)
- **Batch Limit:** Maximum 10 devices per request
- **Security:** MD5 signature authentication on every request

## 🚀 Prerequisites

- **Node.js:** v14.0.0 or higher
- **npm:** Node Package Manager
- **Mock API Server:** Must be running on `http://localhost:3000`

## 📦 Installation

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## ▶️ How to Run

**Important:** Ensure the mock API server is running before starting the client.

Start the data aggregator:

```bash
npm start
```

The application will:

1. Test API connection
2. Generate 500 serial numbers (SN-000 to SN-499)
3. Create 50 batches of 10 devices each
4. Fetch data for all devices (takes ~50 seconds)
5. Save aggregated results to `./results/aggregated_data.json`
6. Display summary statistics

## 🏗️ Architecture & Approach

### Rate Limiting Strategy

I implemented a **queue-based rate limiter** to ensure strict compliance with the 1 req/sec constraint:

- **Queue System:** All API requests are added to a queue and processed sequentially
- **Precise Timing:** Before each request, the system calculates the exact delay needed to maintain 1000ms gaps
- **Smart Scheduling:** Uses `Date.now()` to track the last request time and dynamically calculates wait times
- **No Race Conditions:** Single-threaded queue processing ensures no requests overlap

**Implementation:** [`src/services/rateLimiter.js`](src/services/rateLimiter.js)

```javascript
// Pseudocode flow:
Queue[task1, task2, ...] → Calculate delay → Wait → Execute → Update lastRequestTime → Next
```

### Concurrency Handling

Instead of parallel requests (which would violate rate limits), I use **controlled sequential execution**:

1. All 50 batches are queued upfront
2. The rate limiter processes them one-by-one
3. Each batch waits exactly until 1000ms has passed since the previous request
4. Progress is tracked in real-time with a visual progress bar

### Batching Optimization

To maximize throughput while respecting constraints:

- **Batch Size:** 10 devices per request (maximum allowed)
- **Total Batches:** 50 batches (500 devices ÷ 10)
- **Optimal Time:** ~50 seconds to fetch all data (50 batches × 1 sec/batch)

### Security Implementation

MD5 signature authentication is handled by [`src/utils/signatureGenerator.js`](src/utils/signatureGenerator.js):

```javascript
Signature = MD5(URL + Token + Timestamp);
```

Each request includes:

- `signature` header: MD5 hash
- `timestamp` header: Current time in milliseconds

### Error Handling

Robust error handling with automatic retry logic:

- **Network Failures:** Caught and retried up to 3 times
- **429 Rate Limit Errors:** Automatically retried with exponential backoff
- **Timeout Protection:** 5-second timeout on all requests
- **Error Tracking:** Failed batches logged in results file

**Implementation:** [`src/core/aggregator.js`](src/core/aggregator.js#L63-L87)

## 📁 Project Structure

```
client/
├── src/
│   ├── index.js                 # Entry point
│   ├── config/
│   │   └── constants.js         # Configuration constants
│   ├── core/
│   │   └── aggregator.js        # Main orchestrator logic
│   ├── services/
│   │   ├── apiClient.js         # HTTP client with signature auth
│   │   └── rateLimiter.js       # Queue-based rate limiter
│   └── utils/
│       ├── batchManager.js      # Batch creation & SN generation
│       ├── logger.js            # Colored console logging
│       └── signatureGenerator.js # MD5 signature generation
├── results/
│   └── aggregated_data.json     # Output file with all data
├── package.json
└── README.md
```

### Module Responsibilities

| Module                          | Purpose                                                  |
| ------------------------------- | -------------------------------------------------------- |
| **config/constants.js**         | Centralized configuration (API URL, tokens, batch sizes) |
| **core/aggregator.js**          | Main business logic orchestrator                         |
| **services/apiClient.js**       | HTTP requests with authentication                        |
| **services/rateLimiter.js**     | Queue-based rate limiting                                |
| **utils/batchManager.js**       | Array batching & serial number generation                |
| **utils/logger.js**             | Structured logging with timestamps                       |
| **utils/signatureGenerator.js** | MD5 signature for authentication                         |

## 📊 Output

Results are saved to [`results/aggregated_data.json`](results/aggregated_data.json) with the following structure:

```json
{
  "totalDevices": 500,
  "successfulFetches": 500,
  "failedFetches": 0,
  "timestamp": "2026-02-06T00:36:47.693Z",
  "data": [
    {
      "sn": "SN-000",
      "power": "0.57 kW",
      "status": "Online",
      "last_updated": "2026-02-06T00:35:08.819Z"
    }
    // ... 499 more devices
  ],
  "errors": []
}
```

## 🔍 Assumptions

1. **Mock Server Availability:** The mock API server is running on `http://localhost:3000`
2. **Network Stability:** Network connection is stable during execution
3. **Sequential Processing:** Sequential execution is acceptable (vs. parallel with complex scheduling)
4. **Token Security:** The API token is hardcoded for this assignment (would use env vars in production)
5. **No Partial Results:** All 500 devices must be fetched; partial results are not acceptable
6. **Retry Strategy:** 3 retry attempts with 2-second delays is sufficient for transient failures

## ✨ Features

- ✅ **100% Success Rate:** Successfully fetches all 500 devices
- ✅ **Zero Rate Limit Violations:** No 429 errors during execution
- ✅ **Automatic Retries:** Handles transient failures gracefully
- ✅ **Progress Tracking:** Real-time progress bar with batch status
- ✅ **Colored Logging:** Easy-to-read console output with timestamps
- ✅ **Comprehensive Results:** Detailed summary with success/failure statistics
- ✅ **Graceful Shutdown:** Handles SIGINT (Ctrl+C) cleanly
- ✅ **Error Reporting:** Failed batches logged with details

## 🧪 Testing

To verify the implementation:

1. Start the mock server (in separate terminal):

   ```bash
   cd ../mock-api
   npm start
   ```

2. Run the client:

   ```bash
   npm start
   ```

3. Verify output:
   - Check console for "✅ Data aggregation completed successfully!"
   - Verify `results/aggregated_data.json` exists
   - Confirm `successfulFetches: 500` in the output file

## 📝 Code Quality

- **Modular Design:** Clear separation between API logic, business logic, and utilities
- **Single Responsibility:** Each class/module has one well-defined purpose
- **DRY Principle:** No code duplication
- **Error Handling:** Try-catch blocks on all async operations
- **Documentation:** JSDoc comments on all public methods
- **Consistent Style:** Uniform code formatting throughout

## 👤 Author

**Sahil Suman**

## 📄 License

MIT
