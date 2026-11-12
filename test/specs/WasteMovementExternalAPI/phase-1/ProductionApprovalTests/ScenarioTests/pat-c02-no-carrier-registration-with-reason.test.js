import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Test C02 - No Carrier Registration Number and Reason', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-295', 'DWTA-295', 'jira')
    await addAllureLink('/DWTA-167', 'DWTA-167', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for C02', () => {
    it('should pass when a waste movement is supplied with no carrier registration number and a reason for none @allure.label.tag:DWTA-295', async () => {
      wasteReceiptData.carrier.registrationNumber = null
      wasteReceiptData.carrier.reasonForNoRegistrationNumber = 'ON_SITE'

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'C02',
            wasteTrackingId,
            status: 'Pass',
            message: ''
          }
        ]
      })
    })
  })

  describe('Failed automated assessment for C02', () => {
    it('should fail when a waste movement is supplied with a carrier registration number @allure.label.tag:DWTA-295', async () => {
      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'C02',
            wasteTrackingId,
            status: 'Fail',
            message:
              'Expected carrier.reasonForNoRegistrationNumber to be given for C02'
          }
        ]
      })
    })

    it('should fail when a waste movement is created with a blank reason for no registration number and a receive warning @allure.label.tag:DWTA-295', async () => {
      wasteReceiptData.carrier.registrationNumber = null
      wasteReceiptData.carrier.reasonForNoRegistrationNumber = ''

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'C02',
            wasteTrackingId,
            status: 'Fail',
            message:
              'Expected carrier.reasonForNoRegistrationNumber to be given for C02'
          }
        ]
      })
    })

    it('should fail when a waste movement is created with a null reason for no registration number and a receive warning @allure.label.tag:DWTA-295', async () => {
      wasteReceiptData.carrier.registrationNumber = null
      wasteReceiptData.carrier.reasonForNoRegistrationNumber = null

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const patResponse =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual({
        submissionId: expect.any(String),
        results: [
          {
            scenarioId: 'C02',
            wasteTrackingId,
            status: 'Fail',
            message:
              'Expected carrier.reasonForNoRegistrationNumber to be given for C02'
          }
        ]
      })
    })
  })
})
