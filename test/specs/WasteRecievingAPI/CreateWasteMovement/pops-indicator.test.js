import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('POPs Indicator Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid POPs Indicators', () => {
    it('should accept waste containing POPs with valid data', async () => {
      wasteReceiptData.waste[0].pops = {
        containsPops: true,
        pops: [
          {
            name: 'Aldrin',
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

    it('should accept waste not containing POPs', async () => {
      wasteReceiptData.waste[0].pops = {
        containsPops: false
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

  describe('Invalid POPs Indicators', () => {
    it('should reject waste with missing POPs indicator', async () => {
      wasteReceiptData.waste[0].pops = {
        pops: [
          {
            name: 'Aldrin',
            concentration: 50
          }
        ]
      }
      // Note: containsPops field is intentionally omitted to test required validation

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'waste.0.pops.containsPops',
              errorType: 'NotProvided',
              message:
                'Does the waste contain persistent organic pollutants (POPs)? is required'
            }
          ]
        }
      })
    })
  })
})
