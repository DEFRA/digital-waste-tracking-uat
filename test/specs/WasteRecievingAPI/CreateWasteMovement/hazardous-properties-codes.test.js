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
      wasteReceiptData.waste[0].hazardous.hazCodes = [1]

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
      wasteReceiptData.waste[0].hazardous.hazCodes = [1, 3, 5]

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
      wasteReceiptData.waste[0].hazardous.hazCodes = [1, 1, 3, 3, 5]

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
      wasteReceiptData.waste[0].hazardous.hazCodes = []

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
      delete wasteReceiptData.waste[0].hazardous.hazCodes

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
      wasteReceiptData.waste[0].hazardous.hazCodes = ['HP 17']

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'waste.0.hazardous.hazCodes.0',
              errorType: 'UnexpectedError',
              message: 'Hazard code must be a number'
            }
          ]
        }
      })
    })

    it('should reject submission with non-array hazCodes', async () => {
      wasteReceiptData.waste[0].hazardous.hazCodes = '1,3,5'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'waste.0.hazardous.hazCodes',
              errorType: 'UnexpectedError',
              message: '"HazardCodes" must be an array'
            }
          ]
        }
      })
    })
  })
})
