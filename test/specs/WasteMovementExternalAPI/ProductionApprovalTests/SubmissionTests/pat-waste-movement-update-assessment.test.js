import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Tests After Waste Movement Update', () => {
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

  describe('Assessment after updating waste item count', () => {
    it('should assess R01 and R02 in one request after updating from one waste item to two @allure.label.tag:DWTA-295', async () => {
      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patAfterCreate =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId }
          ]
        )
      expect(patAfterCreate.statusCode).toBe(200)
      expect(patAfterCreate.json).toEqual({
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

      const first = wasteReceiptData.wasteItems[0]
      const updatedData = generateBaseWasteReceiptData()
      updatedData.wasteItems = [first, { ...first }]

      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          wasteTrackingId,
          updatedData
        )
      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({})

      const patAfterUpdate =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId }
          ]
        )
      expect(patAfterUpdate.statusCode).toBe(200)
      expect(patAfterUpdate.json).toEqual({
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
