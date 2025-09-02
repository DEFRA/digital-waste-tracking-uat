import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../support/helpers/auth.js'

describe('Waste Movement API', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('API Documentation and Health', () => {
    it('should return health check response', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.getHealth()

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        message: 'success'
      })
    })
  })

  describe('Waste Movement Creation', () => {
    it('should successfully create a new waste movement with valid data', async () => {
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

    it('should fail to create movement due to missing required fields', async () => {
      const invalidData = generateBaseWasteReceiptData()
      delete invalidData.receipt.disposalOrRecoveryCodes[0].quantity.amount

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          invalidData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: expect.any(String),
              errorType: expect.any(String),
              message: expect.any(String)
            }
          ]
        }
      })
    })
  })

  describe('Waste Movement Updates', () => {
    it('should successfully update an existing waste movement', async () => {
      // First create a movement
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(createResponse.statusCode).toBe(200)

      const globalMovementId = createResponse.json.globalMovementId

      // Update the movement with different disposal codes
      const updatedData = generateBaseWasteReceiptData()
      updatedData.receipt.disposalOrRecoveryCodes = [
        {
          code: 'D1',
          quantity: {
            metric: 'Tonnes',
            amount: 3.0,
            isEstimate: false
          }
        }
      ]

      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          globalMovementId,
          updatedData
        )

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({
        message: 'Receipt movement updated successfully'
      })
    })

    it('should return 404 for non-existent movement ID', async () => {
      const nonExistentId = 'NONEXISTENT123'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          nonExistentId,
          wasteReceiptData
        )

      expect(response.statusCode).toBe(404)
    })
  })
})
