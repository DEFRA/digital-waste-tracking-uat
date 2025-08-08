import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'

const generateSampleMovementData = () => ({
  receivingSiteId: '12345678-1234-1234-1234-123456789012',
  receiverReference: `REF${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  specialHandlingRequirements: 'None',
  waste: [
    {
      ewcCode: '020101',
      description: 'Mixed waste',
      form: 'Mixed',
      containers: 'Bulk',
      quantity: {
        value: 1.5,
        unit: 'Tonnes',
        isEstimate: false
      }
    }
  ],
  carrier: {
    registrationNumber: `REG${Date.now()}`,
    organisationName: 'Test Carrier Ltd',
    address: '123 Test Street',
    emailAddress: `test${Date.now()}@carrier.com`,
    companiesHouseNumber: '12345678',
    phoneNumber: '01234567890',
    vehicleRegistration: 'AB12 CDE',
    meansOfTransport: 'Road'
  },
  acceptance: {
    acceptingAll: true
  },
  receiver: {
    authorisationType: 'TBD',
    authorisationNumber: `AUTH${Date.now()}`,
    regulatoryPositionStatement: 'None'
  },
  receipt: {
    estimateOrActual: 'Actual',
    dateTimeReceived: new Date().toISOString()
  }
})

Given('I have access to the Waste Movement API', function () {
  // Background step - no action needed
})

Given('I have created a waste movement', async function () {
  const sampleMovementData = generateSampleMovementData()
  this.movementData = sampleMovementData

  const response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      sampleMovementData
    )

  expect(response.statusCode).to.equal(200)
  this.globalMovementId = response.data.globalMovementId
  process.stdout.write(
    'Created movement with ID: ' + response.data.globalMovementId + '\n'
  )
})

When('I request the swagger documentation', async function () {
  this.response = await globalThis.apis.wasteMovementExternalAPI.getSwagger()
})

When('I request the health check', async function () {
  this.response = await globalThis.apis.wasteMovementExternalAPI.getHealth()
})

When('I submit a new waste movement with valid data', async function () {
  const sampleMovementData = generateSampleMovementData()
  this.movementData = sampleMovementData

  this.response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      sampleMovementData
    )
})

When('I submit a waste movement with missing quantity data', async function () {
  const invalidData = generateSampleMovementData()
  delete invalidData.waste[0].quantity

  this.response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(invalidData)
})

When('I update the movement quantity to {float}', function (newQuantity) {
  this.movementData.waste[0].quantity.value = newQuantity
})

When('I submit the movement with the existing ID', async function () {
  this.response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
      this.globalMovementId,
      this.movementData
    )
})

When(
  'I submit a movement with non-existent ID {string}',
  async function (movementId) {
    const sampleMovementData = generateSampleMovementData()

    this.response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
        movementId,
        sampleMovementData
      )
  }
)

Then('the response status should be {int}', function (expectedStatus) {
  expect(this.response.statusCode).to.equal(expectedStatus)
})

Then('the content type should be {string}', function (expectedContentType) {
  expect(this.response.responseHeaders['content-type']).to.equal(
    expectedContentType
  )
})

Then('the response should contain success message', function () {
  expect(this.response.data).to.deep.equal({ message: 'success' })
})

Then('the response should contain a global movement ID', function () {
  expect(this.response.data).to.have.property('globalMovementId')
})

Then('the global movement ID should be a string', function () {
  expect(typeof this.response.data.globalMovementId).to.equal('string')
})

Then('the response should contain an error message', function () {
  expect(this.response.data).to.have.property('message')
})
