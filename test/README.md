# Test Framework Documentation

## Overview

This test suite uses Cucumber with Gherkin syntax for behavior-driven development (BDD), ensuring clean and reliable tests for the Digital Waste Tracking service.

## Cucumber Test Structure

Tests are written using Gherkin syntax in `.feature` files and implemented using step definitions in JavaScript.

### Usage

```javascript
const { expect } = require('chai')

Given('I have a valid waste movement', async function () {
  // Setup test data
  this.testData = {
    /* your test data */
  }
})

When('I submit the waste movement', async function () {
  // Perform the action
  this.response = await this.apis.wasteMovementExternalAPI.receiveMovement(
    this.testData
  )
})

Then('the movement should be created successfully', async function () {
  // Verify the result
  expect(this.response.statusCode).to.equal(201)
})
```

### Available APIs

- `this.apis.wasteMovementExternalAPI` - Waste Movement API
- `this.apis.cognitoOAuthApi` - OAuth2 Authentication API

### Key Benefits

- ✅ **BDD Approach**: Tests are written in natural language
- ✅ **Test Isolation**: Each scenario gets fresh API instances automatically
- ✅ **Parallel Safe**: No shared state between scenarios
- ✅ **Readable**: Business stakeholders can understand test scenarios

## Writing Tests

### Feature Files

Create `.feature` files in the `test/features/` directory:

```gherkin
Feature: Waste Movement Management

  Scenario: Create a new waste movement
    Given I have a valid waste movement
    When I submit the waste movement
    Then the movement should be created successfully
    And I should receive a confirmation
```

### Step Definitions

Implement step definitions in `test/step-definitions/`:

```javascript
const { Given, When, Then } = require('@cucumber/cucumber')
const { expect } = require('chai')

Given('I have a valid waste movement', async function () {
  // Arrange - setup test data
  this.testData = {
    /* your test data */
  }
})

When('I submit the waste movement', async function () {
  // Act - perform the action
  this.response = await this.apis.wasteMovementExternalAPI.createMovement(
    this.testData
  )
})

Then('the movement should be created successfully', async function () {
  // Assert - verify the result
  expect(this.response.statusCode).to.equal(201)
  expect(this.response.data).to.include(this.testData)
})
```

### Best Practices

1. **Use descriptive scenario names** - Describe what the scenario verifies
2. **Follow Given-When-Then pattern** - Arrange, Act, Assert
3. **Test one behavior** - Each scenario should verify one specific behavior
4. **Use async/await** - All API calls are asynchronous
5. **Check status codes** - Always verify the HTTP response status
6. **Use tags** - Organize scenarios with tags like `@regression-tests` and `@DWT-XXX`

### Common Patterns

```javascript
// Testing successful API calls
const response = await this.apis.wasteMovementExternalAPI.getHealth()
expect(response.statusCode).to.equal(200)
expect(response.data).to.deep.equal({ message: 'success' })

// Testing error scenarios
const errorResponse =
  await this.apis.wasteMovementExternalAPI.receiveMovement(invalidData)
expect([404, 400]).to.include(errorResponse.statusCode)

// Testing data creation
const newData = {
  /* movement data */
}
const createResponse =
  await this.apis.wasteMovementExternalAPI.receiveMovement(newData)
expect(createResponse.statusCode).to.equal(200)
expect(createResponse.data).to.have.property('globalMovementId')
```

## API Factory

The test framework uses an API factory pattern to provide fresh API instances for each test scenario. This ensures test isolation and prevents state leakage between scenarios.

### Available API Instances

- `this.apis.wasteMovementExternalAPI` - Waste Movement API for managing waste movements
- `this.apis.cognitoOAuthApi` - OAuth2 Authentication API for client credentials flow

### API Factory Implementation

The API factory creates fresh instances before each scenario and cleans them up afterward:

```javascript
// Before each scenario
globalThis.apis = ApiFactory.create()

// After each scenario
delete globalThis.apis
```

## Test Configuration

The test suite automatically validates required environment variables and provides global access to configuration:

```javascript
// Access configuration globally
const clientId = global.testConfig.cognitoClientId
const clientSecret = global.testConfig.cognitoClientSecret
const environment = global.testConfig.environment
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

## Test Tags

The test suite uses tags to organize and categorize scenarios:

- `@regression-tests` - Core regression test scenarios that are run by default with `npm test`
- `@DWT-XXX` - Feature-specific tags for tracking requirements (e.g., `@DWT-480`, `@DWT-381`)
- `@test1`, `@test2` - Legacy tags for specific test scenarios

### Tag Usage Examples

```bash
# Run only regression tests (default npm test behavior)
cucumber-js --tags "@regression-tests"

# Run tests for a specific feature/ticket
cucumber-js --tags "@DWT-XXX"

# Run regression tests for a specific feature
cucumber-js --tags "@regression-tests and @DWT-XXX"

# Run all tests except regression tests
cucumber-js --tags "not @regression-tests"

# Run tests with multiple tags
cucumber-js --tags "@regression-tests and not @DWT-XXX"
```

## Running Tests

- `npm test` - Run regression tests (scenarios tagged with `@regression-tests`) with reporting
- `cucumber-js` - Run all Cucumber tests without reporting
- `cucumber-js --tags "@regression-tests"` - Run only regression tests
- `cucumber-js --tags "not @regression-tests"` - Run all tests except regression tests
- `cucumber-js --tags "@test"` - Run a specific test
- `cucumber-js test/features/xxx.feature` - Run a specific feature file

**Note:** Use `cucumber-js` directly for debugging to avoid the report generation step that runs after tests.

## Troubleshooting

### Common Issues

**Tests hanging or not completing:**

- Check that all async operations use `await`
- Ensure no infinite loops in test logic

**API connection errors:**

- Verify network connectivity
- Check if APIs are accessible from your environment

**Import errors:**

- Ensure all imports use the correct module syntax
- Check that file paths are correct

### Getting Help

1. Check Cucumber configuration in `cucumber.js`
2. Review test setup in `test/support/hooks.js`
3. Look at existing test examples in `test/features/` and `test/step-definitions/`
