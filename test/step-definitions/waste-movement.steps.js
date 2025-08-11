import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'
import { generateBaseWasteReceiptData } from '../support/test-data-manager.js'

Given('I have access to the Waste Movement API', function () {
  // Background step - no action needed
})

Given('I have created a waste movement', async function () {
  const sampleMovementData = generateBaseWasteReceiptData()
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
  const sampleMovementData = generateBaseWasteReceiptData()
  this.movementData = sampleMovementData

  this.response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      sampleMovementData
    )
})

When(
  'I submit a waste movement with missing quantity amount data',
  async function () {
    const invalidData = generateBaseWasteReceiptData()
    delete invalidData.waste[0].quantity.amount

    this.response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        invalidData
      )
  }
)

When('I update the movement amount to {float}', function (newAmount) {
  this.movementData.waste[0].quantity.amount = newAmount
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
    const sampleMovementData = generateBaseWasteReceiptData()

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
  expect(this.response.data).to.have.deep.nested.property(
    'validation.errors.0.message'
  )
  expect(this.response.data).to.not.have.deep.nested.property(
    'validation.errors.1.message'
  )
})

Then('I should be informed that the documentation is available', function () {
  expect(this.response.statusCode).to.equal(200)
})

Then('I should be informed that the API is healthy', function () {
  expect(this.response.statusCode).to.equal(200)
})

Then(
  'I should be informed that the waste movement was created successfully',
  function () {
    expect(this.response.statusCode).to.equal(200)
    expect(this.response.data).to.have.property('globalMovementId')
  }
)

Then(
  'I should be informed that the waste movement was not created',
  function () {
    expect(this.response.statusCode).to.equal(400)
  }
)

Then(
  'I should be informed that the waste movement was updated successfully',
  function () {
    expect(this.response.statusCode).to.equal(200)
  }
)

Then('I should be informed that the movement was not found', function () {
  expect(this.response.statusCode).to.equal(404)
})
