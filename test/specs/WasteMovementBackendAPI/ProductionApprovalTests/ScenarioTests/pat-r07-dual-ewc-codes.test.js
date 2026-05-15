import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
describe('Production Approval Test R07 - Dual EWC Codes', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-166', 'DWTA-166', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for R07', () => {
    it('should pass when a waste movement is supplied with two EWC codes on a waste item', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['020101', '020102']

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R07', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R07',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for R07', () => {
    it('should fail when a waste movement is supplied with only one EWC code on a waste item', async () => {
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R07', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R07',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected at least one waste item to have at least 2 EWC codes for R07'
        }
      ])
    })
  })
})
