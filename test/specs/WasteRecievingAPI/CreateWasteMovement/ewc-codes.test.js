import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('EWC Codes Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid EWC Codes', () => {
    it('should accept a valid 6-digit EWC code', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101'] // Paper and cardboard waste

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should accept multiple valid 6-digit EWC codes (up to 5)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = [
        '020101',
        '020102',
        '020103',
        '020104',
        '020201'
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })
  })

  describe('Invalid EWC Codes', () => {
    it('should reject more than 5 EWC codes', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = [
        '020101',
        '020102',
        '020103',
        '020104',
        '020201',
        '020202'
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.ewcCodes',
              errorType: 'OutOfRange',
              message:
                '"wasteItems[0].ewcCodes" must contain no more than 5 EWC codes'
            }
          ]
        }
      })
    })

    it('should reject missing EWC codes', async () => {
      delete wasteReceiptData.wasteItems[0].ewcCodes

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.ewcCodes',
              errorType: 'NotProvided',
              message: '"wasteItems[0].ewcCodes" is required'
            }
          ]
        }
      })
    })

    it('should reject invalid EWC code format (too short)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['12345'] // Too short - should be 6 digits

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.ewcCodes.0',
              errorType: 'InvalidFormat',
              message:
                '"wasteItems[0].ewcCodes[0]" must be a valid 6-digit numeric code'
            }
          ]
        }
      })
    })

    it('should reject non-existent EWC codes', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['999999'] // Non-existent EWC code

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.ewcCodes.0',
              errorType: 'InvalidValue',
              message:
                '"wasteItems[0].ewcCodes[0]" must be a valid EWC code from the official list'
            }
          ]
        }
      })
    })
  })
})
