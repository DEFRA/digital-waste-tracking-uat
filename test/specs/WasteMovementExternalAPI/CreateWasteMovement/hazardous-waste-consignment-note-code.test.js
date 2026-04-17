import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

// Reference: https://www.gov.uk/guidance/hazardous-waste-consignment-note-supplementary-guidance#a1-consignment-note-code

describe('Hazardous Waste Consignment Note Code Validation', () => {
  let wasteReceiptData

  const expectedInvalidHazardousWasteConsignmentCodeJson = {
    validation: {
      errors: [
        {
          key: 'hazardousWasteConsignmentCode',
          errorType: 'InvalidFormat',
          message:
            '"hazardousWasteConsignmentCode" must be in one of the valid formats: EA/NRW (2 or more alphanumeric characters followed by / and 5-6 alphanumeric characters, e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
        }
      ]
    }
  }

  beforeEach(async () => {
    await addAllureLink('/DWT-328', 'DWT-328', 'jira')
    await addAllureLink('/DWTA-148', 'DWTA-148', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('EA/NRW consignment code format', () => {
    it('should accept movement when hazardous consignment code is EA/NRW format with digits only before the slash @allure.label.tag:DWTA-148', async () => {
      applyHazardousMovementWithConsignmentCode(
        wasteReceiptData,
        '123456/A0001'
      )

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should reject movement when EA/NRW code has fewer than five characters after the slash @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, '123456/A12')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual(
        expectedInvalidHazardousWasteConsignmentCodeJson
      )
    })

    it('should accept movement when hazardous consignment code is EA/NRW format with letters only before the slash @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(
        wasteReceiptData,
        'CJTILE/A0001'
      )

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should reject movement when EA/NRW code has no slash between producer and site parts @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'CJTILEA0001')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual(
        expectedInvalidHazardousWasteConsignmentCodeJson
      )
    })

    it('should accept movement when hazardous consignment code is EA/NRW format with letters and digits before the slash @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(
        wasteReceiptData,
        'AB12CD/A0001'
      )

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

  describe('NIEA consignment code format', () => {
    it('should accept movement when hazardous consignment code is valid NIEA format @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'DA5301234')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should reject movement when NIEA code does not start with DA, DB, or DC @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'DD5301234')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual(
        expectedInvalidHazardousWasteConsignmentCodeJson
      )
    })

    it('should reject movement when NIEA serial has six digits instead of seven @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'DA123456')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual(
        expectedInvalidHazardousWasteConsignmentCodeJson
      )
    })
  })

  describe('SEPA consignment code format', () => {
    it('should accept movement when hazardous consignment code is valid SEPA format @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'SB1234567')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should reject movement when SEPA code does not start with SA, SB, or SC @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'SD1234567')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual(
        expectedInvalidHazardousWasteConsignmentCodeJson
      )
    })

    it('should reject movement when SEPA serial has six digits instead of seven @allure.label.tag:DWT-328', async () => {
      applyHazardousMovementWithConsignmentCode(wasteReceiptData, 'SB123456')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual(
        expectedInvalidHazardousWasteConsignmentCodeJson
      )
    })
  })

  describe('Hazardous EWC Code included in Mirror Code', () => {
    it('should accept movement when EWC list mixes non-hazardous and hazardous codes and a consignment code is supplied @allure.label.tag:DWT-328', async () => {
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
    it('should accept movement for non-hazardous waste when no consignment code is supplied @allure.label.tag:DWT-328', async () => {
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

    it('should accept movement for non-hazardous waste when a consignment code is supplied @allure.label.tag:DWT-328', async () => {
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
})

/**
 * @param {Object} movementData - payload from generateBaseWasteReceiptData()
 * @param {string} hazardousWasteConsignmentCode - value for hazardousWasteConsignmentCode
 */
function applyHazardousMovementWithConsignmentCode(
  movementData,
  hazardousWasteConsignmentCode
) {
  movementData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
  movementData.wasteItems[0].containsHazardous = true
  movementData.wasteItems[0].hazardous = {
    hazCodes: ['HP_1', 'HP_3'],
    sourceOfComponents: 'PROVIDED_WITH_WASTE',
    components: [
      {
        name: 'Mercury',
        concentration: 0.25
      }
    ]
  }
  movementData.hazardousWasteConsignmentCode = hazardousWasteConsignmentCode
}
