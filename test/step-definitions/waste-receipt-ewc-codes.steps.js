import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'

import { generateBaseWasteReceiptData } from '../support/test-data-manager.js'

Given(
  'I have a complete waste movement receipt with valid base data',
  function () {
    this.wasteReceiptData = generateBaseWasteReceiptData()
  }
)

Given('I have a valid authentication header', function () {
  // not implemented yet - will be done in the future
})

Given('the waste item has a valid 6-digit EWC code', function () {
  this.wasteReceiptData.waste[0].ewcCodes = ['020101'] // Paper and cardboard waste
})

Given('the waste item has multiple valid 6-digit EWC codes', function () {
  // Set multiple valid EWC codes (up to 5 as per business rules)
  this.wasteReceiptData.waste[0].ewcCodes = [
    '020101',
    '020102',
    '020103',
    '020104',
    '020201'
  ]
})

Given('the waste item has more than 5 EWC codes', function () {
  // Set more than 5 EWC codes to test the limit
  this.wasteReceiptData.waste[0].ewcCodes = [
    '020101',
    '020102',
    '020103',
    '020104',
    '020201',
    '020202'
  ]
})

Given('the waste item has no EWC code', function () {
  delete this.wasteReceiptData.waste[0].ewcCodes
})

Given('the waste item has an invalid EWC code format', function () {
  this.wasteReceiptData.waste[0].ewcCodes = ['12345'] // Too short - should be 6 digits
})

Given('the waste item has a non-existent EWC code', function () {
  this.wasteReceiptData.waste[0].ewcCodes = ['999999'] // Non-existent EWC code
})

When('I submit the waste movement receipt', async function () {
  this.response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      this.wasteReceiptData
    )
})

Then(
  'I should be informed that a maximum of 5 EWC codes are allowed',
  function () {
    expect(this.response.statusCode).to.equal(400)

    // Check validation errors for maximum EWC codes message
    const expectedErrors = [
      {
        key: 'waste.0.ewcCodes',
        errorType: 'UnexpectedError',
        message: '"waste[0].ewcCodes" must contain no more than 5 EWC codes'
      }
    ]
    expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
  }
)

Then('I should be informed that an EWC code is required', function () {
  expect(this.response.statusCode).to.equal(400)

  // Check validation errors for required EWC codes message
  const expectedErrors = [
    {
      key: 'waste.0.ewcCodes',
      errorType: 'NotProvided',
      message: '"waste[0].ewcCodes" is required'
    }
  ]
  expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
})

Then('I should be informed that the EWC code format is invalid', function () {
  expect(this.response.statusCode).to.equal(400)

  // Check validation errors for invalid EWC code format message
  const expectedErrors = [
    {
      key: 'waste.0.ewcCodes.0',
      errorType: 'UnexpectedError',
      message: '"waste[0].ewcCodes[0]" must be a valid 6-digit numeric code'
    }
  ]
  expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
})

Then(
  'I should be informed that the EWC code is not found in the official list',
  function () {
    expect(this.response.statusCode).to.equal(400)

    // Check validation errors for non-existent EWC code message
    const expectedErrors = [
      {
        key: 'waste.0.ewcCodes.0',
        errorType: 'UnexpectedError',
        message:
          '"waste[0].ewcCodes[0]" must be a valid EWC code from the official list'
      }
    ]
    expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
  }
)
