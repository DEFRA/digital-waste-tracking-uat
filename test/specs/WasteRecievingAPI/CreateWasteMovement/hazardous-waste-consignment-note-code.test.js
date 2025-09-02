import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

/**
 * Hazardous Waste Consignment Note Code Validation Tests
 *
 * Based on OpenAPI specification:
 * - hazardousWasteConsignmentCode: string (format: XXXXXX/YYYYY)
 * - If EWC is HAZ, then mandatory
 * - XXXXXX: 6 letters followed by forward slash /
 * - YYYYY: 5-character unique identifier (letters or numbers, no spaces/symbols)
 * - If any waste.ewcCodes are "not hazardous", consignment code is not required
 *
 * Reference: https://www.gov.uk/guidance/hazardous-waste-consignment-note-supplementary-guidance#a1-consignment-note-code
 */
describe('Hazardous Waste Consignment Note Code Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Require consignment code for hazardous waste', () => {
    it('should accept hazardous waste without consignment code (current API behavior)', async () => {
      // Use a known hazardous EWC code
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
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

    it('should accept valid consignment code with hazardous EWC', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107'] // Hazardous EWC code
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

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

  describe('Hazardous EWC Code included in Mirror Code', () => {
    it('should accept mixed EWC codes without consignment code (current API behavior)', async () => {
      // Mix of hazardous and non-hazardous EWC codes
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107', '150110']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }

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

    it('should accept valid consignment code with mixed EWC codes including hazardous', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107', '150110']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

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

  describe('Do not require consignment code for non-hazardous waste', () => {
    it('should accept non-hazardous EWC codes without consignment code', async () => {
      // Use non-hazardous EWC codes only
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150110']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: false
      }

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

    it('should accept optional consignment code for non-hazardous waste', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150110']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: false
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

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

  describe('Consignment Code format validation', () => {
    it('should reject format with invalid prefix (numbers in XXXXXX)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = '123456/A0001' // Invalid: numbers in prefix

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'hazardousWasteConsignmentCode',
              errorType: 'UnexpectedError',
              message:
                'consignment note code must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })

    it('should reject format with missing forward slash', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILEA0001' // Missing forward slash

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'hazardousWasteConsignmentCode',
              errorType: 'UnexpectedError',
              message:
                'consignment note code must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })

    it('should reject format with invalid unique ID (spaces/symbols)', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A00 1' // Invalid: contains space

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'hazardousWasteConsignmentCode',
              errorType: 'UnexpectedError',
              message:
                'consignment note code must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })

    it('should accept valid consignment code format', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

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

  describe('Additional format validations', () => {
    it('should accept consignment code with additional letter suffix', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['150107']
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001V' // V suffix for waste removed from ships

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

    it('should accept other valid consignment code suffixes', async () => {
      const validSuffixes = ['F', 'D', 'P', 'M'] // flytipped, derogation, piped, multies

      for (const suffix of validSuffixes) {
        const testData = generateBaseWasteReceiptData()
        testData.wasteItems[0].ewcCodes = ['150107']
        testData.wasteItems[0].hazardous = {
          containsHazardous: true,
          hazCodes: [1, 3]
        }
        testData.hazardousWasteConsignmentCode = `CJTILE/A0001${suffix}`

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
})
