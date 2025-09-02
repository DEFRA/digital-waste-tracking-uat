import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateCompleteWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Carrier Means of transport Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateCompleteWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Validate the waste carrier is using an allowed means of transportation', () => {
    it.each([
      ['Road'],
      ['Sea'],
      ['Air'],
      ['Rail'],
      ['Inland Waterway'],
      ['Piped'],
      ['Other']
    ])(
      'should accept a means of transport with value "%s" ',
      async (transportationValue) => {
        wasteReceiptData.carrier.meansOfTransport = transportationValue
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
        // ToDo:Assert that the record has been created successfully in the DB
      }
    )
  })

  it('should not allow waste movement to be created when there is no means of transport provided', async () => {
    delete wasteReceiptData.carrier.meansOfTransport
    const response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        wasteReceiptData
      )

    expect(response.statusCode).toBe(400)
    // ToDo: should there be a specific error populated in the response ??
    // expect(response.json).toHaveProperty('globalMovementId')
  })

  it('should not allow waste movement to be created when there is an invalid means of transport value provided', async () => {
    wasteReceiptData.carrier.meansOfTransport = 'incorrect'
    const response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        wasteReceiptData
      )

    expect(response.statusCode).toBe(400)
    expect(response.json).toHaveProperty(
      'validation.errors[0].key',
      'carrier.meansOfTransport'
    )
    expect(response.json).toHaveProperty(
      'validation.errors[0].message',
      // eslint-disable-next-line no-useless-escape
      '\"carrier.meansOfTransport\" must be one of [Road, Rail, Air, Sea, Inland Waterway, Piped, Other]'
    )
  })

  describe('should be allowed to update means of transportation of a carrier in an existing waste movement, with any of the valid values', () => {
    it.each([
      ['Road'],
      ['Sea'],
      ['Air'],
      ['Rail'],
      ['Inland Waterway'],
      ['Piped'],
      ['Other']
    ])(
      'should accept a means of transport with value "%s" ',
      async (transportationValue) => {
        const elements = [
          'Road',
          'Sea',
          'Air',
          'Rail',
          'Inland Waterway',
          'Piped',
          'Other'
        ]
        const randomElement =
          elements[Math.floor(Math.random() * elements.length)]

        wasteReceiptData.carrier.meansOfTransport = randomElement
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')

        const globalMovementId = response.json.globalMovementId

        // Update the movement with different disposal codes
        // const updatedData = generateBaseWasteReceiptData()
        const updatedData = { ...wasteReceiptData }
        delete updatedData.receipt
        updatedData.carrier.meansOfTransport = transportationValue

        const updateResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
            globalMovementId,
            updatedData
          )

        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.json).toHaveProperty(
          'message',
          'Receipt movement updated successfully'
        )
        // ToDo:Assert that the record has been updated successfully in the DB
      }
    )
  })

  it('should not be allowed to update means of transport in an existing waste movement with an invalid value', async () => {
    wasteReceiptData.carrier.meansOfTransport = 'Road'
    const response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        wasteReceiptData
      )

    expect(response.statusCode).toBe(200)
    expect(response.json).toHaveProperty('globalMovementId')

    const globalMovementId = response.json.globalMovementId

    // Update the movement with different disposal codes
    // const updatedData = generateBaseWasteReceiptData()
    const updatedData = { ...wasteReceiptData }
    delete updatedData.receipt
    updatedData.carrier.meansOfTransport = 'invalid'

    const updateResponse =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
        globalMovementId,
        updatedData
      )

    expect(updateResponse.statusCode).toBe(400)
    expect(updateResponse.json).toHaveProperty(
      'message',
      'Receipt movement updated successfully'
    )

    expect(updateResponse.json).toHaveProperty(
      'validation.errors[0].key',
      'carrier.meansOfTransport'
    )
    expect(updateResponse.json).toHaveProperty(
      'validation.errors[0].message',
      // eslint-disable-next-line no-useless-escape
      '\"carrier.meansOfTransport\" must be one of [Road, Rail, Air, Sea, Inland Waterway, Piped, Other]'
    )
  })
})
