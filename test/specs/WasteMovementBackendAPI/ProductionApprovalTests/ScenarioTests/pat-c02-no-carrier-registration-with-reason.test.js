import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
describe('Production Approval Test C02 - No Carrier Registration Number and Reason', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-167', 'DWTA-167', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for C02', () => {
    it('should pass when a waste movement is supplied with no carrier registration number and a reason for none', async () => {
      wasteReceiptData.carrier.registrationNumber = null
      wasteReceiptData.carrier.reasonForNoRegistrationNumber = 'ON_SITE'

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'C02',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for C02', () => {
    it('should fail when a waste movement is supplied with a carrier registration number', async () => {
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'C02',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected carrier.reasonForNoRegistrationNumber to be given for C02'
        }
      ])
    })

    it('should fail when a waste movement is created with a blank reason for no registration number and a receive warning', async () => {
      wasteReceiptData.carrier.registrationNumber = null
      wasteReceiptData.carrier.reasonForNoRegistrationNumber = ''

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'C02',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected carrier.reasonForNoRegistrationNumber to be given for C02'
        }
      ])
    })

    it('should fail when a waste movement is created with a null reason for no registration number and a receive warning', async () => {
      wasteReceiptData.carrier.registrationNumber = null
      wasteReceiptData.carrier.reasonForNoRegistrationNumber = null

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'C02', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'C02',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected carrier.reasonForNoRegistrationNumber to be given for C02'
        }
      ])
    })
  })
})
