import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

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
    await addAllureLink('/DWT-328', 'DWT-328', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Require consignment code for hazardous waste', () => {
    it('should accept valid EA/NRW format consignment code @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should accept consignment code with valid suffix @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001V' // V suffix for waste removed from ships

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should accept SEPA format consignment code @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'SB1234567' // SEPA format

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should accept NIEA format consignment code @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'DA5301234' // NIEA format

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

  describe('Hazardous EWC Code included in Mirror Code', () => {
    it('should require consignment code when mixed EWC codes include hazardous @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107', '150110'] // Mix: non-hazardous (020101, 150107) and hazardous (150110*)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

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

  describe('Do not require consignment code for non-hazardous waste', () => {
    it('should not require consignment code for non-hazardous waste @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107'] // Non-hazardous EWC codes
      wasteReceiptData.wasteItems[0].containsHazardous = false
      wasteReceiptData.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should accept optional consignment code for non-hazardous waste @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107'] // Non-hazardous EWC codes
      wasteReceiptData.wasteItems[0].containsHazardous = false
      wasteReceiptData.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED'
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

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

  describe('Consignment Note Code supplied in incorrect format', () => {
    it('should reject EA/NRW format with invalid prefix @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
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
              errorType: 'InvalidFormat',
              message:
                '"hazardousWasteConsignmentCode" must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })

    it('should reject format with missing forward slash @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
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
              errorType: 'InvalidFormat',
              message:
                '"hazardousWasteConsignmentCode" must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })

    it('should reject SEPA format with invalid prefix @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'SD1234567' // Invalid SEPA prefix (should be SA|SB|SC)

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
              errorType: 'InvalidFormat',
              message:
                '"hazardousWasteConsignmentCode" must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })

    it('should reject NIEA format with invalid prefix @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'DD5301234' // Invalid NIEA prefix (should be DA|DB|DC)

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
              errorType: 'InvalidFormat',
              message:
                '"hazardousWasteConsignmentCode" must be in one of the valid formats: EA/NRW (e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
            }
          ]
        }
      })
    })
  })
})
