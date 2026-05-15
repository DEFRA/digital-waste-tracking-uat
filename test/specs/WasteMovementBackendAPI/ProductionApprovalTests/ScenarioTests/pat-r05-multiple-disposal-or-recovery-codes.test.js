import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
describe('Production Approval Test R05 - Multiple Disposal or Recovery Codes', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-166', 'DWTA-166', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for R05', () => {
    it('should pass when a waste movement is supplied with multiple disposal or recovery codes', async () => {
      wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes = [
        {
          code: 'R1',
          weight: {
            metric: 'Tonnes',
            amount: 1.5,
            isEstimate: false
          }
        },
        {
          code: 'D1',
          weight: {
            metric: 'Tonnes',
            amount: 1.0,
            isEstimate: false
          }
        }
      ]

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R05', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R05',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })

    it('should pass when multiple disposal or recovery codes are only on the second waste item', async () => {
      const first = wasteReceiptData.wasteItems[0]
      const second = { ...first }
      second.disposalOrRecoveryCodes = [
        {
          code: 'R1',
          weight: {
            metric: 'Tonnes',
            amount: 1.5,
            isEstimate: false
          }
        },
        {
          code: 'D1',
          weight: {
            metric: 'Tonnes',
            amount: 1.0,
            isEstimate: false
          }
        }
      ]
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
          [{ scenarioId: 'R05', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R05',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for R05', () => {
    it('should fail when a waste movement is supplied with only one disposal or recovery code', async () => {
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R05', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R05',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected at least one waste item to have multiple disposal or recovery codes for R05'
        }
      ])
    })
  })
})
