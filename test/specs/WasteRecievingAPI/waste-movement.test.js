import { describe, it, expect } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../support/test-data-manager.js'

describe('Waste Movement API', () => {
  describe('API Documentation and Health', () => {
    it('should return swagger documentation', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.getSwagger()

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toBe('text/html; charset=utf-8')
    })

    it('should return health check response', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.getHealth()

      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('message')
      expect(response.json.message).toBe('success')
    })
  })

  describe('Waste Movement Creation', () => {
    it('should successfully create a new waste movement with valid data', async () => {
      const sampleMovementData = generateBaseWasteReceiptData()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          sampleMovementData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })

    it('should fail to create movement due to missing required fields', async () => {
      const invalidData = generateBaseWasteReceiptData()
      delete invalidData.waste[0].quantity.amount

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
      const sampleMovementData = generateBaseWasteReceiptData()
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          sampleMovementData
        )
      expect(createResponse.statusCode).toBe(200)

      const globalMovementId = createResponse.json.globalMovementId

      // Update the movement
      sampleMovementData.waste[0].quantity.amount = 3.0
      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          globalMovementId,
          sampleMovementData
        )

      expect(updateResponse.statusCode).toBe(200)
    })

    it('should return 404 for non-existent movement ID', async () => {
      const sampleMovementData = generateBaseWasteReceiptData()
      const nonExistentId = 'non-existent-id-12345'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          nonExistentId,
          sampleMovementData
        )

      expect(response.statusCode).toBe(404)
    })
  })
})
