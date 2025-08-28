import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

describe('Waste Movement Creation', () => {
  let wasteReceiptData

  beforeEach(() => {
    wasteReceiptData = generateBaseWasteReceiptData()
  })

  describe('Successful Creation', () => {
    it('should successfully create a new waste movement with valid data', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    })
  })

  describe('Failed Creation', () => {
    it('should fail to create movement due to missing required fields', async () => {
      const invalidData = generateBaseWasteReceiptData()
      delete invalidData.waste[0].quantity.amount

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          invalidData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toHaveProperty('validation.errors.0.message')
      expect(response.json).not.toHaveProperty('validation.errors.1.message')
    })
  })
})
