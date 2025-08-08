import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'

const generateBaseWasteReceiptData = () => ({
  receivingSiteId: '12345678-1234-1234-1234-123456789012',
  yourUniqueReference: `REF${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  specialHandlingRequirements: 'None',
  waste: [
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      form: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'Skip containers',
      quantity: {
        metric: 'Tonnes',
        amount: 2.5,
        isEstimate: false
      }
    }
  ],
  carrier: {
    organisationName: 'Test Carrier Ltd',
    address: '123 Test Street, Test City, TC1 2AB',
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890',
    meansOfTransport: 'Road'
  },
  acceptance: {
    acceptingAll: true
  },
  receipt: {
    dateTimeReceived: new Date().toISOString(),
    disposalOrRecoveryCodes: [
      {
        code: 'R1',
        quantity: {
          metric: 'Tonnes',
          amount: 2.5,
          isEstimate: false
        }
      }
    ]
  }
})

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
  'I should be informed that the waste movement was created successfully',
  function () {
    // Check the response status code of http request
    expect(this.response).to.have.property('statusCode')
    expect(this.response.statusCode).to.equal(200)

    // Check the response data of http request
    expect(this.response.data).to.have.property('globalMovementId')
    expect(this.response.data).to.have.property('statusCode') // status code is also in the response data
    expect(typeof this.response.data.globalMovementId).to.equal('string')
    expect(typeof this.response.data.statusCode).to.equal('number')
    expect(this.response.data.globalMovementId.length).to.be.greaterThan(0)
    expect(this.response.data.statusCode).to.equal(200)
  }
)

Then(
  'I should be informed that the waste movement was not created',
  function () {
    expect(this.response.statusCode).to.equal(400)

    // Check for validation errors structure
    expect(this.response.data).to.have.property('validation')
    expect(this.response.data.validation).to.have.property('errors')
    expect(this.response.data.validation.errors).to.be.an('array')
    expect(this.response.data.validation.errors.length).to.be.greaterThan(0)
  }
)

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
