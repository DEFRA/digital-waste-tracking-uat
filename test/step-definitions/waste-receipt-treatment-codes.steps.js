import { Given, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { generateBaseWasteReceiptData } from '../support/test-data-manager.js'

/**
 * Step definitions for Treatment Codes Validation feature
 * Tests disposal and recovery codes validation for waste movement receipts
 */

Given(
  'I have a complete waste movement receipt with valid base data without disposal or recovery treatment codes',
  function () {
    this.wasteReceiptData = generateBaseWasteReceiptData()
    this.wasteReceiptData.receipt.disposalOrRecoveryCodes = []
  }
)

Given(
  /^the waste movement receipt has a valid disposal or recovery treatment code of (.*) and a quantity of ([0-9]*\.?[0-9]+) (Tonnes)$/,
  function (treatmentCode, quantity, metric) {
    this.wasteReceiptData.receipt.disposalOrRecoveryCodes.push({
      code: treatmentCode,
      quantity: {
        metric,
        amount: quantity,
        isEstimate: false
      }
    })
  }
)

Given(
  'the waste movement receipt has no disposal or recovery treatment codes',
  function () {
    // Remove disposal or recovery treatment codes
    if (this.wasteReceiptData.receipt.disposalOrRecoveryCodes) {
      delete this.wasteReceiptData.receipt.disposalOrRecoveryCodes
    }
  }
)

Given(
  'the waste movement receipt has an unrecognized disposal or recovery treatment code',
  function () {
    // Set an invalid treatment code
    this.wasteReceiptData.receipt.disposalOrRecoveryCodes = [
      {
        code: 'INVALID',
        quantity: {
          metric: 'Tonnes',
          amount: 2.5,
          isEstimate: false
        }
      }
    ]
  }
)

Given(
  'the waste movement receipt has a valid disposal or recovery treatment code without quantity',
  function () {
    // Set treatment code without quantity
    this.wasteReceiptData.receipt.disposalOrRecoveryCodes = [
      {
        code: 'R1'
        // Missing quantity field
      }
    ]
  }
)

Then(
  'I should be informed that disposal or recovery treatment codes are required',
  function () {
    // This step is for scenarios where codes are required but not provided
    // The API should still accept the request if codes are optional
    expect(this.response.statusCode).to.equal(200)

    const expectedWarnings = [
      {
        key: 'receipt.disposalOrRecoveryCodes',
        errorType: 'NotProvided',
        message:
          'Disposal or Recovery codes are required for proper waste tracking and compliance'
      }
    ]
    expect(this.response.data.validation.warnings).to.deep.equal(
      expectedWarnings
    )
  }
)

Then('I should be informed that the treatment code is not valid', function () {
  expect(this.response.statusCode).to.equal(400)

  // Check validation errors for invalid treatment code message
  const expectedErrors = [
    {
      key: 'receipt.disposalOrRecoveryCodes.0.code',
      errorType: 'UnexpectedError',
      message:
        '"receipt.disposalOrRecoveryCodes[0].code" must be one of [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15]'
    }
  ]
  expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
})

Then(
  'I should be informed that a quantity is required for the treatment code',
  function () {
    expect(this.response.statusCode).to.equal(400)

    // Check validation errors for required quantity message
    const expectedErrors = [
      {
        key: 'receipt.disposalOrRecoveryCodes.0.quantity',
        errorType: 'NotProvided',
        message: '"Quantity" is required'
      }
    ]
    expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
  }
)
