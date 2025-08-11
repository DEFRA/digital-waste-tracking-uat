# Test Support Documentation

## Test Data Manager

The `test-data-manager.js` file provides centralized test data generation for waste receipt API tests, ensuring consistency across all test scenarios.

### Usage

Import the data generation functions in your step definition files:

```javascript
import { generateBaseWasteReceiptData } from '../support/test-data-manager.js'
```

### Available Functions

#### `generateBaseWasteReceiptData()`

Generates a complete waste receipt data object with all required fields for the waste receipt API format.

**Returns:** Object with the following structure:

- `receivingSiteId`: UUID for the receiving site
- `yourUniqueReference`: Auto-generated unique reference
- `specialHandlingRequirements`: Special handling requirements
- `waste`: Array containing waste item data
- `carrier`: Carrier information
- `acceptance`: Acceptance details
- `receipt`: Receipt information with disposal/recovery codes

### Example Usage

```javascript
Given(
  'I have a complete waste movement receipt with valid base data',
  function () {
    this.wasteReceiptData = generateBaseWasteReceiptData()
  }
)

Given('I have created a waste movement', async function () {
  const sampleMovementData = generateBaseWasteReceiptData()
  this.movementData = sampleMovementData

  // Use the data in your test...
})
```

### Benefits

- **Consistency**: All tests use the same base data structure
- **Maintainability**: Changes to data structure only need to be made in one place
- **Reusability**: Multiple step definition files can import and use the same data
- **Simplicity**: No complex utility methods, just data generation functions

### Modifying Data

After generating the base data, you can modify specific fields as needed for your test scenarios:

```javascript
Given('the waste item has a valid 6-digit EWC code', function () {
  this.wasteReceiptData.waste[0].ewcCodes = ['020101']
})

Given('the waste item has no EWC code', function () {
  delete this.wasteReceiptData.waste[0].ewcCodes
})
```

This approach keeps the test data manager simple while allowing flexibility in individual test steps.
