# EnergyGrid Data Aggregator

A complete solution for the EnergyGrid coding assignment: fetch real-time telemetry from 500 solar inverters while navigating strict API rate limits and security protocols.

## Project Overview

This repository contains two main components:

1. **Client Application** - Fetches data from 500 solar inverters with rate limiting and authentication
2. **Mock API Server** - Simulates the legacy EnergyGrid API with strict constraints

## Quick Start

### 1. Install Dependencies

```bash
# Install mock API dependencies
cd mock-api
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Mock API Server

In one terminal:

```bash
cd mock-api
npm start
```

You should see:

```
EnergyGrid Mock API running on port 3000
Constraints: 1 req/sec, Max 10 items/batch
```

### 3. Run the Client

In another terminal:

```bash
cd client
npm start
```

The client will fetch data from all 500 devices (~50 seconds) and save results to `client/results/aggregated_data.json`.

## Repository Structure

```
egc/
├── README.md                    # This file
├── .gitignore                   # Git ignore rules
│
├── mock-api/                    # Mock API Server
│   ├── server.js                # Express server with rate limiting
│   ├── test-api.js              # Quick API test script
│   ├── package.json
│   ├── README.md                # Mock API documentation
│   └── instructions.md          # Assignment specifications
│
└── client/                      # Client Application (Your Solution)
    ├── src/
    │   ├── index.js             # Entry point
    │   ├── config/              # Configuration
    │   ├── core/                # Business logic
    │   ├── services/            # API client & rate limiter
    │   └── utils/               # Helpers & utilities
    ├── results/                 # Output directory
    ├── package.json
    └── README.md                # Client documentation & approach
```

## Documentation

- **[Client README](client/README.md)** - Detailed explanation of the solution, architecture, and approach
- **[Mock API README](mock-api/README.md)** - API server setup and usage
- **[Assignment Instructions](mock-api/instructions.md)** - Original coding assignment requirements

## Assignment Requirements Met

- Generate 500 serial numbers (SN-000 to SN-499)
- Fetch data for all 500 devices
- Aggregate results into single report
- Optimize throughput with batching (10 devices/request)
- Handle rate limiting (1 request/second)
- Implement MD5 signature authentication
- Error handling with automatic retries
- Clean, modular code structure

## Solution Highlights

### Rate Limiting

- **Queue-based architecture** ensures strict 1 req/sec compliance
- **Zero 429 errors** in production testing
- **Precise timing** with dynamic delay calculation

### Security

- **MD5 signature authentication** on every request
- Formula: `MD5(URL + Token + Timestamp)`

### Performance

- **Batching optimization:** 50 batches × 10 devices = 500 devices in ~50 seconds
- **100% success rate** with automatic retry logic

### Code Quality

- **Modular architecture:** Clear separation of concerns
- **Comprehensive error handling:** Network failures, timeouts, retries
- **Real-time progress tracking:** Visual progress bar
- **Full documentation:** JSDoc comments on all methods

## Results Example

After running, check `client/results/aggregated_data.json`:

```json
{
  "totalDevices": 500,
  "successfulFetches": 500,
  "failedFetches": 0,
  "timestamp": "2026-02-06T00:36:47.693Z",
  "data": [
    /* 500 device records */
  ],
  "errors": []
}
```

## Testing

1. **Test Mock API Connection:**

   ```bash
   cd mock-api
   node test-api.js
   ```

2. **Run Full Client:**

   ```bash
   cd client
   npm start
   ```

3. **Verify Results:**
   - Check `client/results/aggregated_data.json`
   - Confirm `successfulFetches: 500`

## Technology Stack

- **Runtime:** Node.js (v14+)
- **HTTP Client:** Axios
- **Server:** Express.js (mock API)
- **Crypto:** Node.js built-in `crypto` module

## Author

**Sahil Suman**

## License

MIT

---

For detailed information about each component, see:

- [Client Documentation](client/README.md)
- [Mock API Documentation](mock-api/README.md)
