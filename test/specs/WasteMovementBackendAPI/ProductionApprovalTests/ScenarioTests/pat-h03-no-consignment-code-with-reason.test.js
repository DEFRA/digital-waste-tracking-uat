import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Production Approval Test H03 - No Consignment Code With Reason', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-179', 'DWTA-179', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for H03', () => {
    it('should pass when hazardous waste is supplied with no consignment note code and a reason for none', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121']
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
      wasteReceiptData.reasonForNoConsignmentCode = 'NO_DOC_WITH_WASTE'
      expect(wasteReceiptData).not.toHaveProperty(
        'hazardousWasteConsignmentCode'
      )

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'H03', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'H03',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for H03', () => {
    it('should fail when hazardous waste is supplied with a consignment note code', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121']
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
      expect(wasteReceiptData).not.toHaveProperty('reasonForNoConsignmentCode')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'H03', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'H03',
          wasteTrackingId,
          status: 'Fail',
          message: 'Expected reasonForNoConsignmentCode to be given for H03'
        }
      ])
    })
  })
})
