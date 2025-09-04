import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Hazardous Component Concentration Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Concentration Values', () => {
    it('should accept waste with valid concentration value', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: 5.5
          }
        ]
      }

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

    it('should accept waste with zero concentration value', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: 0
          }
        ]
      }

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

    it('should accept waste with "Not Supplied" concentration value', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: 'Not Supplied'
          }
        ]
      }

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

  describe('Invalid Concentration Values', () => {
    it('should reject waste with missing concentration value', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury'
            // Missing concentration field
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.components.0.concentration',
              errorType: 'NotProvided',
              message:
                'Chemical or Biological concentration is required when hazardous properties are present'
            }
          ]
        }
      })
    })

    it('should reject waste with negative concentration value', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: -10
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.components.0.concentration',
              errorType: 'UnexpectedError',
              message: 'Chemical or Biological concentration cannot be negative'
            }
          ]
        }
      })
    })

    it('should reject waste with non-numeric concentration value', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: 'invalid'
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.components.0.concentration',
              errorType: 'UnexpectedError',
              message:
                'Chemical or Biological concentration must be a valid number or "Not Supplied"'
            }
          ]
        }
      })
    })

    it('should reject waste with concentration provided for non-hazardous waste', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: false,
        components: [
          {
            name: 'Mercury',
            concentration: 50
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous',
              errorType: 'UnexpectedError',
              message:
                'Chemical or Biological concentration cannot be provided when hazardous properties are not present'
            }
          ]
        }
      })
    })
  })

  describe('Concentration Warnings', () => {
    it('should accept waste with blank concentration but show warning', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Mercury',
            concentration: ''
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
      // Note: Warning about concentration field being legally required should be in response
      // This may need to be adjusted based on actual API response structure for warnings
    })
  })
})
