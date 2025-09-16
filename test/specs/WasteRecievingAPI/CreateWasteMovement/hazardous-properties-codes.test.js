import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Hazardous Properties Codes (hazCodes) Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()
    wasteReceiptData.wasteItems[0].hazardous = {
      containsHazardous: true,
      hazCodes: ['HP_1', 'HP_3', 'HP_5'],
      components: [
        {
          name: 'Mercury',
          concentration: 12.5
        }
      ]
    }

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successfully Specifying Valid Hazardous Properties Codes', () => {
    it('should accept submission with single hazardous property code', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['HP_1']

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
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['HP_1', 'HP_3', 'HP_5']

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
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['HP_1', 'HP_1', 'HP_3', 'HP_3', 'HP_5']

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

    it('should accept submission with HP_POP hazardous property code', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['HP_POP']

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
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['HP 17']

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
              message: '"wasteItems[0].hazardous.hazCodes[0]" must be one of [HP_1, HP_2, HP_3, HP_4, HP_5, HP_6, HP_7, HP_8, HP_9, HP_10, HP_11, HP_12, HP_13, HP_14, HP_15, HP_POP]'
            }
          ]
        }
      })
    })

    it('should reject submission with non-existent hazardous property code', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = ['HP_999']

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
              message: '"wasteItems[0].hazardous.hazCodes[0]" must be one of [HP_1, HP_2, HP_3, HP_4, HP_5, HP_6, HP_7, HP_8, HP_9, HP_10, HP_11, HP_12, HP_13, HP_14, HP_15, HP_POP]'
            }
          ]
        }
      })
    })

    it('should reject submission with non-array hazCodes', async () => {
      wasteReceiptData.wasteItems[0].hazardous.hazCodes = '1,3,5'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.hazCodes',
              errorType: 'UnexpectedError',
              message: '"HazardCodes" must be an array'
            }
          ]
        }
      })
    })
  })
})
