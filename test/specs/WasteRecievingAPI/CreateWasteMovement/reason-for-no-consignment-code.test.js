import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

/**
 * Reason for No Consignment Code Validation Tests
 *
 * Based on OpenAPI specification:
 * - reasonForNoConsignmentCode: string
 * - If any waste.ewcCodes are hazardous and hazardousWasteConsignmentCode is not provided,
 *   then reasonForNoConsignmentCode is required
 * - If hazardousWasteConsignmentCode is provided, reasonForNoConsignmentCode must be one of:
 *   - "Non-Haz Waste Transfer"
 *   - "Carrier did not provide documentation"
 *   - "Household Waste Recycling Centre Receipt"
 *
 * Enum values:
 * [ "Non-Haz Waste Transfer", "Carrier did not provide documentation", "Household Waste Recycling Centre Receipt" ]
 */
describe('Reason for No Consignment Code Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Require reason when consignment code is missing for hazardous waste', () => {
    it('should accept hazardous waste without reason (current API behavior)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      // No hazardousWasteConsignmentCode provided

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

    it('should accept valid reason when consignment code is not provided', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.reasonForNoConsignmentCode =
        'Carrier did not provide documentation'

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

  describe('Valid reason values', () => {
    it('should accept all valid reason enum values', async () => {
      const validReasons = [
        'Non-Haz Waste Transfer',
        'Carrier did not provide documentation',
        'Household Waste Recycling Centre Receipt'
      ]

      for (const reason of validReasons) {
        const testData = generateBaseWasteReceiptData()
        testData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
        testData.wasteItems[0].hazardous = {
          containsHazardous: true,
          hazCodes: [1, 3]
        }
        testData.reasonForNoConsignmentCode = reason

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            testData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toEqual({
          statusCode: 200,
          globalMovementId: expect.any(String)
        })
      }
    })
  })

  describe('Invalid reason values', () => {
    it('should accept invalid reason values (current API behavior)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.reasonForNoConsignmentCode = 'Invalid reason'

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

    it('should accept empty reason value (current API behavior)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.reasonForNoConsignmentCode = ''

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

  describe('Reason not required scenarios', () => {
    it('should provide warning for non-hazardous waste (current API behavior)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150110'] // Non-hazardous EWC codes
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: false
      }
      // No reasonForNoConsignmentCode provided

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String),
        validation: {
          warnings: [
            {
              key: 'receipt.reasonForNoConsignmentCode',
              errorType: 'NotProvided',
              message:
                'Reason for no Consignment Note Code is required when hazardous EWC codes are present'
            }
          ]
        }
      })
    })

    it('should not require reason when consignment code is provided', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'
      // No reasonForNoConsignmentCode provided

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

    it('should accept optional reason when consignment code is provided', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'
      wasteReceiptData.reasonForNoConsignmentCode =
        'Carrier did not provide documentation'

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

  describe('Mixed EWC codes scenarios', () => {
    it('should accept mixed EWC codes without reason (current API behavior)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107', '150110'] // Mix of hazardous and non-hazardous
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      // No hazardousWasteConsignmentCode provided

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String),
        validation: {
          warnings: [
            {
              key: 'receipt.reasonForNoConsignmentCode',
              errorType: 'NotProvided',
              message:
                'Reason for no Consignment Note Code is required when hazardous EWC codes are present'
            }
          ]
        }
      })
    })

    it('should accept reason when mixed EWC codes include hazardous and no consignment code', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107', '150110'] // Mix of hazardous and non-hazardous
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.reasonForNoConsignmentCode =
        'Household Waste Recycling Centre Receipt'

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
})
