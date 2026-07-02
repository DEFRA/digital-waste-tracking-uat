# Test Framework Documentation

## Overview

This test suite uses Jest for unit and integration testing, ensuring clean and reliable tests for the Digital Waste Tracking service. The framework integrates with Allure for comprehensive test reporting.

## Jest Test Structure

Tests are written using Jest's describe/it syntax and organized by feature in the `test/specs/` directory.

### Usage

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals'

describe('Waste Movement API', () => {
  let wasteReceiptData

  beforeEach(() => {
    wasteReceiptData = generateBaseWasteReceiptData()
  })

  it('should create a waste movement successfully', async () => {
    const response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        wasteReceiptData
      )

    expect(response.statusCode).toBe(200)
    expect(response.data).toHaveProperty('wasteTrackingId')
  })
})
```

### Available APIs

- `globalThis.apis.wasteMovementExternalAPI` - Waste Movement API
- `globalThis.apis.cognitoOAuthApi` - OAuth2 Authentication API

### Key Benefits

- ✅ **Modern Testing**: Uses Jest, a popular and well-maintained testing framework
- ✅ **Test Isolation**: Each test gets fresh API instances automatically
- ✅ **Parallel Safe**: No shared state between tests
- ✅ **Allure Integration**: Comprehensive test reporting with allure-jest
- ✅ **ES Modules**: Full support for modern JavaScript module syntax

## Writing Tests

### Test Files

Create `.test.js` files in the `test/specs/` directory:

```javascript
import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../support/test-data-manager.js'

describe('Waste Movement Management', () => {
  let testData

  beforeEach(() => {
    testData = generateBaseWasteReceiptData()
  })

  it('should create a new waste movement', async () => {
    const response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(testData)

    expect(response.statusCode).toBe(200)
    expect(response.data).toHaveProperty('wasteTrackingId')
  })
})
```

### Test Structure

Follow the Arrange-Act-Assert pattern:

```javascript
describe('Feature Name', () => {
  let testData

  beforeEach(() => {
    // Arrange - setup test data
    testData = generateBaseWasteReceiptData()
  })

  it('should perform the expected action', async () => {
    // Act - perform the action
    const response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(testData)

    // Assert - verify the result
    expect(response.statusCode).toBe(200)
    expect(response.data).toHaveProperty('wasteTrackingId')
  })
})
```

### Best Practices

1. **Use descriptive test names** - Describe what the test verifies
2. **Follow Arrange-Act-Assert pattern** - Setup, Action, Verification
3. **Test one behavior** - Each test should verify one specific behavior
4. **Use async/await** - All API calls are asynchronous
5. **Check status codes** - Always verify the HTTP response status
6. **Use beforeEach for setup** - Initialize test data before each test
7. **Group related tests** - Use describe blocks to organize tests logically

### Common Patterns

```javascript
// Testing successful API calls
const response = await globalThis.apis.wasteMovementExternalAPI.getHealth()
expect(response.statusCode).toBe(200)
expect(response.data).toEqual({ message: 'success' })

// Testing error scenarios
const errorResponse =
  await globalThis.apis.wasteMovementExternalAPI.receiveMovement(invalidData)
expect([404, 400]).toContain(errorResponse.statusCode)

// Testing data creation
const newData = generateBaseWasteReceiptData()
const createResponse =
  await globalThis.apis.wasteMovementExternalAPI.receiveMovement(newData)
expect(createResponse.statusCode).toBe(200)
expect(createResponse.data).toHaveProperty('wasteTrackingId')

// Testing with test.each for multiple scenarios
it.each([[12.5], [500], [0]])(
  'should accept concentration value of %f mg/kg',
  async (concentrationValue) => {
    // Test implementation
  }
)
```

## API Factory

The test framework uses an API factory pattern to provide fresh API instances for each test. This ensures test isolation and prevents state leakage between tests.

### Available API Instances

- `globalThis.apis.wasteMovementExternalAPI` - Waste Movement API for managing waste movements
- `globalThis.apis.cognitoOAuthApi` - OAuth2 Authentication API for client credentials flow

### API Factory Implementation

The API factory creates fresh instances before each test and cleans them up afterward:

```javascript
// Before each test
beforeEach(() => {
  globalThis.apis = ApiFactory.create()
})

// After each test
afterEach(async () => {
  await globalThis.apis?.close()
  delete globalThis.apis
})
```

## Test Configuration

The test suite automatically validates required environment variables and provides global access to configuration:

```javascript
// Access configuration globally
const clientId = globalThis.testConfig.cognitoClientId
const clientSecret = globalThis.testConfig.cognitoClientSecret
const environment = globalThis.testConfig.environment
```

### Configuration Validation

The test suite validates that all required environment variables are present when tests start. If any required variables are missing, tests will fail with a clear error message.

## Global Setup

Before Jest workers start, `test/support/jest/global-setup.js` runs in a separate Node.js process and:

1. Resolves an API code — creates one via `createApiCodeForOrganisation` when `API_CODE_IN_GIO_ORG_EXCLUDE_LIST` is unset, or picks a random code from the list when it is set
2. Looks up the organisation via `getOrganisationByApiCode` and reads `defraCustomerOrganisationId`
3. Sets `GENERATED_API_CODE` and `GENERATED_DEFRA_ID` on `process.env` for worker processes
4. When `PROXY_MODE=zap`, initialises the ZAP session (see [ZAP security scan](#zap-security-scan-two-step))

Worker processes read these values in `test/support/jest/setup.js` as `globalThis.generatedApiCode` and `globalThis.generatedDefraId`. See `CONFIGURATION.md` for required environment variables and runtime-generated variable details.

Global setup is skipped when `EXCLUDE_GLOBAL_SETUP=true` (used by `test:zap-gate`). Tests that depend on `generatedApiCode` or `generatedDefraId` will fail without global setup.

## Environment Configuration

Some tests require environment variables to be set. Before running tests, configure your environment:

```bash
# Source the environment variables
source ../env.sh

# Then run your tests
npm test
```

See `CONFIGURATION.md` for detailed setup instructions.

## Test Organization

The test suite is organized by feature and functionality:

- `test/specs/Authentication/` - OAuth2 authentication tests
- `test/specs/Security/ZapGate/` - ZAP passive scan gate (second Jest run after scan)
- `test/specs/WasteRecievingAPI/CreateWasteMovement/` - Waste movement creation tests
- `test/specs/WasteRecievingAPI/UpdateWasteMovement/` - Waste movement update tests

### Test Categories

Tests are organized into logical groups:

- **Authentication Tests** - OAuth2 client credentials flow
- **EWC Codes Validation** - European Waste Catalogue codes validation
- **POPs Indicator Validation** - Persistent Organic Pollutants validation
- **Treatment Codes Validation** - Disposal and recovery codes validation
- **Hazardous Concentration Validation** - Chemical component concentration validation
- **Weight Estimate Validation** - Waste weight estimate indicators
- **Receiving Site ID Validation** - Site ownership and existence validation

## Running Tests

- `npm test` - Run UAT profile tests (`test:uat` by default)
- `npm run test:integration` - Integration API tests (excludes `@Authentication`)
- `npm run test:uat` - UAT profile including bulk upload and authentication
- `npm run test:smoke` - Tests tagged `@smoke`
- `npm run test:prod-smoke` - Tests tagged `@prod-smoke` (A small subset of tests to run after production releases)
- `npm run test:zap-gate` - ZAP gate only (`PROXY_MODE=off`; requires scan artefacts)
- `jest` - Run Jest directly without report scripts
- `jest --testPathPattern=test/specs/Authentication/` - Run specific test directories
- `jest --testNamePattern="should authenticate successfully"` - Run tests matching a pattern

**Source env and open Allure report:**

- `npm run source:clean:test:integration:report` — integration tests
- `npm run source:clean:test:uat:report` — UAT profile
- `npm run source:clean:test:integration-zap:report` — ZAP scan + gate (see below)

**Note:** Use `jest` directly for debugging to avoid the report generation step that runs after tests.

## ZAP security scan (two-step)

OWASP ZAP passive scanning is intended for **Docker Compose CI** (internal HTTP service URLs), not CDP HTTPS endpoints. When `PROXY_MODE=zap`, API traffic is proxied through ZAP. The **scan** and **gate** are separate Jest runs so the gate can run with `PROXY_MODE=off` and read reports from disk.

### Flow

1. **Scan** — set `PROXY_MODE=zap` and `HTTP_PROXY` to the ZAP proxy (e.g. in `env.sh`), then run integration tests:
   - `test/support/jest/global-setup.js` — resolves API code and organisation ID, then `newSession` and disable passive scan rules listed in `zapPassiveScanRulesToDisable`
   - Tests execute through the proxy
   - `test/support/jest/global-teardown.js` — writes `zap-report/zap.json`, `zap.html`, and `alerts-summary.json`
2. **Gate** — `PROXY_MODE=off`, `npm run test:zap-gate`:
   - `test/specs/Security/ZapGate/zap-gate.test.js` — asserts artefacts exist, attaches all three reports to Allure, fails when `alertsSummary.High !== 0`

`npm run source:clean:test:integration-zap:report` runs `report:clean`, scan, gate, Allure generate, and opens the report (sources `env.sh` first).

### Environment variables

| Variable      | Scan run                   | Gate run           |
| ------------- | -------------------------- | ------------------ |
| `PROXY_MODE`  | `zap`                      | `off`              |
| `HTTP_PROXY`  | ZAP proxy and REST API URL | ignored when `off` |
| `ZAP_API_KEY` | ZAP API key                | not used           |

`PROXY_MODE` also supports `cdp` (proxy external calls only, e.g. Cognito). See `test/support/test-config.js`.

### Passive scan rules disabled for CI

Docker Compose uses HTTP and Basic auth on the internal network, which triggers ZAP plugin **10105** (Authentication Credentials Captured). Plugin ids to disable are listed in `test/support/jest/global-setup.js` (`setPassiveScannerAlertThreshold` → `OFF`). Add or remove ids there as needed; the gate still expects `High: 0` in `alerts-summary.json`.

### Artefacts

| Path                             | Written by       | Used by gate       |
| -------------------------------- | ---------------- | ------------------ |
| `zap-report/zap.json`            | `globalTeardown` | Allure attachment  |
| `zap-report/zap.html`            | `globalTeardown` | Allure attachment  |
| `zap-report/alerts-summary.json` | `globalTeardown` | Assertion + Allure |

`npm run report:clean` removes `zap-report/` along with `allure-results/` and `allure-report/`.

## Allure Reporting

The test suite integrates with Allure for comprehensive test reporting:

- `npm run report:generate` - Generate Allure report from test results
- `npm run report:open` - Open the generated report in browser
- `npm run report:clean` - Clean Allure and `zap-report/` directories
- `npm run report:publish` - Generate and publish reports

## Troubleshooting

### Common Issues

**Tests hanging or not completing:**

- Check that all async operations use `await`
- Ensure no infinite loops in test logic
- Verify Jest timeout settings in `jest.config.js`

**API connection errors:**

- Verify network connectivity
- Check if APIs are accessible from your environment
- Verify environment variables are set correctly

**Import errors:**

- Ensure all imports use the correct ES module syntax
- Check that file paths are correct
- Verify Jest configuration supports ES modules

### Getting Help

1. Check Jest configuration in `jest.config.js`
2. Review test setup in `test/support/jest/setup.js`
3. Look at existing test examples in `test/specs/`
4. Check Jest documentation for syntax and best practices
