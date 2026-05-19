import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Production Approval Test B01 - Broker or Dealer Involvement', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-168', 'DWTA-168', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for B01', () => {
    it('should pass when a waste movement is supplied with broker or dealer involvement', async () => {
      wasteReceiptData.brokerOrDealer = {
        organisationName: 'Test Broker Ltd',
        address: {
          fullAddress: '123 Test Street, Test City',
          postcode: 'TC1 2AB'
        }
      }

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'B01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'B01',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for B01', () => {
    it('should fail when a waste movement is supplied with no broker or dealer involvement', async () => {
      expect(wasteReceiptData).not.toHaveProperty('brokerOrDealer')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'B01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'B01',
          wasteTrackingId,
          status: 'Fail',
          message: 'No broker or dealer involvement in the movement'
        }
      ])
    })
  })
})
