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
    expect(response.data).toHaveProperty('globalMovementId')
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
    expect(response.data).toHaveProperty('globalMovementId')
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
    expect(response.data).toHaveProperty('globalMovementId')
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
expect(createResponse.data).toHaveProperty('globalMovementId')

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
afterEach(() => {
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

- `npm test` - Run all tests with Allure reporting
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Run tests with coverage reporting
- `jest` - Run Jest directly without reporting
- `jest --testPathPattern=test/specs/Authentication/` - Run specific test directories
- `jest --testNamePattern="should authenticate successfully"` - Run tests matching a pattern

**Note:** Use `jest` directly for debugging to avoid the report generation step that runs after tests.

## Allure Reporting

The test suite integrates with Allure for comprehensive test reporting:

- `npm run report:generate` - Generate Allure report from test results
- `npm run report:open` - Open the generated report in browser
- `npm run report:clean` - Clean up report files
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
2. Review test setup in `test/support/jest-setup.js`
3. Look at existing test examples in `test/specs/`
4. Check Jest documentation for syntax and best practices
