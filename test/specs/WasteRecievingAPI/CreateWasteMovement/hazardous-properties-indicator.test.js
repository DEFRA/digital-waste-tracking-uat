import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Hazardous Properties Indicator Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()
    
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Hazardous Indicator', () => {
    it('should accept waste receipt when hazardous indicator is set to true and no components are provided', async () => {
      wasteReceiptData.waste[0].hazardous = {
        containsHazardous: true
        // Missing components array
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

    it('should accept waste receipt when hazardous indicator is set to false and no components are provided', async () => {
      wasteReceiptData.waste[0].hazardous = {
        containsHazardous: false
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

    it('should accept waste receipt when hazardous indicator is set to true and components are provided', async () => {
      wasteReceiptData.waste[0].hazardous = {
        containsHazardous: true,
        components: [
          {
            name: 'Test Hazardous Chemical',
            concentration: 50
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

    it('should accept waste receipt when hazardous indicator is set to false and components are provided', async () => {
      wasteReceiptData.waste[0].hazardous = {
        containsHazardous: false,
        components: [
          {
            name: 'Test Chemical',
            concentration: 50
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

  describe('Missing Hazardous Indicator', () => {
    it('should reject waste receipt when hazardous indicator field is missing and components are provided', async () => {
      wasteReceiptData.waste[0].hazardous = {
        components: [
          {
            name: 'Test Hazardous Chemical',
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
              key: 'waste.0.hazardous.containsHazardous',
              errorType: 'NotProvided',
              message:
                'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
            }
          ]
        }
      })
    })
  })
})
