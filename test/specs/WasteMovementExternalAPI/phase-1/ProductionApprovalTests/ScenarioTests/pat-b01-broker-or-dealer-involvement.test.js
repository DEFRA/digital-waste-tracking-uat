import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Test B01 - Broker or Dealer Involvement', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-295', 'DWTA-295', 'jira')
    await addAllureLink('/DWTA-168', 'DWTA-168', 'jira')
    await addAllureLink('/DWTA-293', 'DWTA-293', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for B01', () => {
    it('should pass when a waste movement is supplied with broker or dealer involvement @allure.label.tag:DWTA-295', async () => {
      wasteReceiptData.brokerOrDealer = {
        organisationName: 'Test Broker Ltd',
        address: {
          fullAddress: '123 Test Street, Test City',
          postcode: 'TC1 2AB'
        }
      }

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'B01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'B01',
            wasteTrackingId,
            status: 'Pass',
            message: ''
          }
        ]
      })
    })
  })

  describe('Failed automated assessment for B01', () => {
    it('should fail when a waste movement is supplied with no broker or dealer involvement @allure.label.tag:DWTA-295', async () => {
      expect(wasteReceiptData).not.toHaveProperty('brokerOrDealer')

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'B01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'B01',
            wasteTrackingId,
            status: 'Fail',
            message: 'No broker or dealer involvement in the movement'
          }
        ]
      })
    })
  })
})
