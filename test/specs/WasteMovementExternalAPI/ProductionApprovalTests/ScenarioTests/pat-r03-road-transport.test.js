import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Test R03 - Road Transport', () => {
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

  describe('Passed automated assessment for R03', () => {
    it('should pass when a waste movement is supplied with road transport and a vehicle registration @allure.label.tag:DWTA-295', async () => {
      wasteReceiptData.carrier.meansOfTransport = 'Road'
      wasteReceiptData.carrier.vehicleRegistration = 'AB12 CDE'

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'R03', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'R03',
            wasteTrackingId,
            status: 'Pass',
            message: ''
          }
        ]
      })
    })
  })

  describe('Failed automated assessment for R03', () => {
    it('should fail when a waste movement is supplied without road transport @allure.label.tag:DWTA-295', async () => {
      wasteReceiptData.carrier.meansOfTransport = 'Other'
      delete wasteReceiptData.carrier.vehicleRegistration

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'R03', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'R03',
            wasteTrackingId,
            status: 'Fail',
            message:
              'Expected carrier.meansOfTransport to be "Road" for R03, found "Other"'
          }
        ]
      })
    })
  })
})
