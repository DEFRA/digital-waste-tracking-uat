import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
describe('Production Approval Test R04 - No Disposal or Recovery Codes', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-166', 'DWTA-166', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for R04', () => {
    it('should pass when a waste movement is supplied with no disposal or recovery codes', async () => {
      delete wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R04', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R04',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for R04', () => {
    it('should fail when a waste movement is supplied with disposal or recovery codes', async () => {
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R04', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R04',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected no disposal or recovery codes for R04, found codes on waste item(s) at index 0'
        }
      ])
    })

    it('should fail when disposal or recovery codes are only on the second waste item', async () => {
      const first = wasteReceiptData.wasteItems[0]
      const second = { ...first }
      delete first.disposalOrRecoveryCodes
      wasteReceiptData.wasteItems = [first, second]

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R04', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R04',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected no disposal or recovery codes for R04, found codes on waste item(s) at index 1'
        }
      ])
    })
  })
})
