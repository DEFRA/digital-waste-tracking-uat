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
    it.each([['Sea'], ['Other']])(
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

  it.skip('should not allow waste movement to be created when there is no means of transport provided', async () => {
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
    expect(response.json).toEqual({
      validation: {
        errors: [
          {
            key: 'carrier.meansOfTransport',
            errorType: 'UnexpectedError',
            message:
              '"carrier.meansOfTransport" must be one of [Road, Rail, Air, Sea, Inland Waterway, Piped, Other]'
          }
        ]
      }
    })
  })
})
