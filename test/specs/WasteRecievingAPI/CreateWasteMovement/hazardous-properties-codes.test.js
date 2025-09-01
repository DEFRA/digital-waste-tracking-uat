import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Hazardous Properties Codes (hazCodes) Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successfully Specifying Valid Hazardous Properties Codes', () => {
    it('should accept submission with single hazardous property code', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = [5]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })

    it('should accept submission with multiple hazardous property codes', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = [5, 10, 12]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })

    it('should accept submission with duplicate hazardous property codes', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = [5, 5, 10]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })
  })

  describe('Attempting to Submit Without Specifying Hazardous Properties Codes', () => {
    it('should accept submission when hazCodes array is empty', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })

    it('should accept submission when hazCodes field is missing', async () => {
      delete wasteReceiptData.wasteItems[0].hazardous.hazCodes

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })
  })

  describe('Specifying Invalid Hazardous Property Code Format', () => {
    it('should reject submission with invalid hazardous property code format', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['invalid']

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.hazCodes.0',
              errorType: 'UnexpectedError',
              message: 'Hazard code must be a number'
            }
          ]
        }
      })
    })

    it('should reject submission with non-existent hazardous property code', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = [999]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.hazCodes.0',
              errorType: 'UnexpectedError',
              message: 'Hazard code must be between 1 and 15 (HP1-HP15)'
            }
          ]
        }
      })
    })
  })
})
