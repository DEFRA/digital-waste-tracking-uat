import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Tests With a Single Waste Tracking Id', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-295', 'DWTA-295', 'jira')
    await addAllureLink('/DWTA-177', 'DWTA-177', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Multiple scenarios assessed against one movement', () => {
    it('should return mixed R01 and R02 results for a single waste item movement @allure.label.tag:DWTA-295', async () => {
      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId }
          ]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'R01',
            wasteTrackingId,
            status: 'Pass',
            message: ''
          },
          {
            scenarioId: 'R02',
            wasteTrackingId,
            status: 'Fail',
            message: 'Expected more than 1 waste item for R02, found 1'
          }
        ]
      })
    })

    it('should return mixed R01 and R02 results for a multiple waste item movement @allure.label.tag:DWTA-295', async () => {
      const first = wasteReceiptData.wasteItems[0]
      wasteReceiptData.wasteItems = [first, { ...first }]

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId }
          ]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'R01',
            wasteTrackingId,
            status: 'Fail',
            message: 'Multiple waste items provided'
          },
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
})
