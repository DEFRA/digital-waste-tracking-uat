# Test Setup

## Automatic API Isolation

APIs are automatically provided for each test with fresh instances to prevent data bleed when running in parallel.

### Usage

```javascript
import { expect } from '@jest/globals'

describe('My Test Suite', () => {
  it('should work with automatically provided APIs', async () => {
    // APIs are automatically available - no setup required!
    const response = await global.apis.example.getPost(1)
    expect(response.statusCode).toBe(200)
  })
})
```

### Available APIs

- `global.apis.example` - JSONPlaceholder test API
- `global.apis.wasteMovementExternalAPI` - Waste Movement API

### Key Benefits

- ✅ **Zero Setup**: No `beforeEach` or imports needed
- ✅ **Test Isolation**: Each test gets fresh API instances automatically
- ✅ **Parallel Safe**: No shared state between tests
- ✅ **Clean**: Just write your tests, APIs are handled automatically
