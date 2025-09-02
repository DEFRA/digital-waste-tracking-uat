import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Receiving Site ID Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Site IDs', () => {
    it('should accept waste movement receipt for an owned site', async () => {
      // Note: This test assumes the API validates site ownership
      wasteReceiptData.receivingSiteId = '12345678-1234-1234-1234-123456789012'

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

  describe('Invalid Site IDs', () => {
    it('should accept waste movement receipt for an unowned site (no validation)', async () => {
      // NOTE: Current API implementation doesn't validate site ownership
      wasteReceiptData.receivingSiteId = '87654321-4321-4321-4321-210987654321'

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

    it('should accept waste movement receipt for a non-existent site (no validation)', async () => {
      // NOTE: Current API implementation doesn't validate site existence
      wasteReceiptData.receivingSiteId = 'non-existent-site-id'

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

    it('should reject waste movement receipt with missing site ID', async () => {
      delete wasteReceiptData.receivingSiteId

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receivingSiteId',
              errorType: 'NotProvided',
              message: '"receivingSiteId" is required'
            }
          ]
        }
      })
    })
  })
})
