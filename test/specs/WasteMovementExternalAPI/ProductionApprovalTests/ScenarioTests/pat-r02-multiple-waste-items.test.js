import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Test R02 - Multiple Waste Items', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-295', 'DWTA-295', 'jira')
    await addAllureLink('/DWTA-166', 'DWTA-166', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for R02', () => {
    it('should pass when a waste movement is supplied with multiple waste items @allure.label.tag:DWTA-295', async () => {
      const first = wasteReceiptData.wasteItems[0]
      wasteReceiptData.wasteItems = [first, { ...first }]

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'R02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'R02',
            wasteTrackingId,
            status: 'Pass',
            message: ''
          }
        ]
      })
    })
  })

  describe('Failed automated assessment for R02', () => {
    it('should fail when a waste movement is supplied with a single waste item @allure.label.tag:DWTA-295', async () => {
      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'R02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'R02',
            wasteTrackingId,
            status: 'Fail',
            message: 'Expected more than 1 waste item for R02, found 1'
          }
        ]
      })
    })
  })
})
