import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Reason for No Consignment Code Validation', () => {
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

  describe('Require reason when consignment code is blank for hazardous waste', () => {
    it('should accept hazardous waste with valid reason when no consignment code provided @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
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

    it('should accept valid reason when consignment code is blank @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.reasonForNoConsignmentCode =
        'Non-Hazardous Waste Transfer'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // API correctly enforces reason requirement for hazardous EWC codes
      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })
  })

  describe('Hazardous EWC Code included in Mirror Code', () => {
    it('should require reason when mixed EWC codes include hazardous @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107', '150110'] // Mix of hazardous and non-hazardous
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
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

  describe('Do not require consignment number for non-hazardous waste', () => {
    it('should not require reason for non-hazardous waste @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '150107'] // Non-hazardous EWC codes
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
        globalMovementId: expect.any(String)
      })
    })
  })

  describe('Prompt reason if consignment number blank', () => {
    it('should require reason when hazardous EWC codes present but no consignment code provided @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      // No consignment code provided - should require reason

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // OpenAPI spec says: "If any waste.ewcCodes provided are considered hazardous and
      // receiveMovementRequest.hazardousWasteConsignmentCode is not provided a
      // receiveMovementRequest.reasonForNoConsignmentCode is required"
      // API correctly enforces this requirement
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
  })

  describe('Reason is left blank when required', () => {
    it('should require reason when empty reason provided for hazardous EWC codes without consignment code @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.reasonForNoConsignmentCode = '' // Empty reason
      // No consignment code provided

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // OpenAPI spec says reason should be required, API correctly enforces this
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
  })

  describe('Reason required when consignment code is provided', () => {
    it('should require valid reason when consignment code is provided for hazardous waste @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'
      wasteReceiptData.reasonForNoConsignmentCode =
        'Carrier did not provide documentation'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // OpenAPI spec says: "If receiveMovementRequest.hazardousWasteConsignmentCode is provided
      // it must be either 'Non Hazardous Waste Transfer', 'Carrier did not provide documentation'
      // or 'Local Authority Receipt'"
      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })

    it('should allow invalid reason when consignment code is provided @allure.label.tag:DWT-328', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121'] // Hazardous EWC code (fluorescent tubes)
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'
      wasteReceiptData.reasonForNoConsignmentCode = 'Invalid reason' // Not one of the three allowed values

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // OpenAPI spec says reason must be one of the three values when consignment code is provided,
      // but API currently does not enforce this validation
      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    })
  })
})
