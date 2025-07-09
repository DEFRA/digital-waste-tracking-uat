# Test Framework Documentation

## Overview

This test suite uses Jest with automatic API isolation, ensuring clean and reliable tests for the Digital Waste Tracking service.

## Automatic API Isolation

APIs are automatically provided for each test with fresh instances to prevent data bleed when running in parallel.

### Usage

```javascript
import { expect } from '@jest/globals'

describe('My Test Suite', () => {
  it('should work with automatically provided APIs', async () => {
    // APIs are automatically available - no setup required!
    const response = await globalThis.apis.example.getPost(1)
    expect(response.statusCode).toBe(200)
  })
})
```

### Available APIs

- `globalThis.apis.example` - JSONPlaceholder test API
- `globalThis.apis.wasteMovementExternalAPI` - Waste Movement API

### Key Benefits

- ✅ **Zero Setup**: No `beforeEach` or imports needed
- ✅ **Test Isolation**: Each test gets fresh API instances automatically
- ✅ **Parallel Safe**: No shared state between tests
- ✅ **Clean**: Just write your tests, APIs are handled automatically

## Writing Tests

### Basic Structure

```javascript
import { expect } from '@jest/globals'

describe('Feature Name', () => {
  describe('Specific Function', () => {
    it('should do something specific', async () => {
      // Arrange
      const testData = {
        /* your test data */
      }

      // Act
      const result = await globalThis.apis.example.createPost(testData)

      // Assert
      expect(result.statusCode).toBe(201)
      expect(result.data).toMatchObject(testData)
    })
  })
})
```

### Best Practices

1. **Use descriptive test names** - Describe what the test verifies
2. **Follow AAA pattern** - Arrange, Act, Assert
3. **Test one thing** - Each test should verify one specific behavior
4. **Use async/await** - All API calls are asynchronous
5. **Check status codes** - Always verify the HTTP response status

### Common Patterns

```javascript
// Testing successful API calls
const response = await globalThis.apis.example.getPost(1)
expect(response.statusCode).toBe(200)
expect(response.data).toHaveProperty('id', 1)

// Testing error scenarios
const errorResponse = await globalThis.apis.example.getPost(999999)
expect([404, 200]).toContain(errorResponse.statusCode) // Handle API quirks

// Testing data creation
const newData = { title: 'Test', body: 'Content', userId: 1 }
const createResponse = await globalThis.apis.example.createPost(newData)
expect(createResponse.statusCode).toBe(201)
expect(createResponse.data).toMatchObject(newData)
```

## Environment Configuration

Some tests require environment variables to be set. Before running tests, configure your environment:

```bash
# Source the environment variables
source ../env.sh

# Then run your tests
npm test
```

See `CONFIGURATION.md` for detailed setup instructions.

## Running Tests

- `npm test` - Run all tests with reporting
- `npm run test:watch` - Run tests in watch mode
- `npm run test:debug` - Debug tests
- `npm run test:coverage` - Generate coverage report
- `npm run test:ci` - Run tests in CI mode
- `npm run test:verbose` - Run with detailed output

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

1. Check Jest configuration in `jest.config.js`
2. Review test setup in `test/setup/jestSetupFilesAfterEnv.js`
3. Look at existing test examples in `test/specs/`
