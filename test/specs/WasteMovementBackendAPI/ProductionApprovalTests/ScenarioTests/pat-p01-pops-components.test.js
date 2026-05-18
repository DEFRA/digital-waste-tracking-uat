import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Production Approval Test P01 - POPs Components', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-178', 'DWTA-178', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for P01', () => {
    it('should pass when a waste movement is supplied with multiple POPs components', async () => {
      wasteReceiptData.wasteItems[0].containsPops = true
      wasteReceiptData.wasteItems[0].pops = {
        sourceOfComponents: 'OWN_TESTING',
        components: [
          {
            code: 'HBB',
            concentration: 2.5
          },
          {
            code: 'CHL',
            concentration: 2.0
          }
        ]
      }
      expect(wasteReceiptData.wasteItems[0].pops.components.length).toBeGreaterThan(1)

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'P01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'P01',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for P01', () => {
    it('should fail when a waste movement is supplied with no POPs components', async () => {
      expect(wasteReceiptData.wasteItems[0].containsPops).toBe(false)
      expect(wasteReceiptData.wasteItems[0]).not.toHaveProperty('pops')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'P01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'P01',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected one or more waste items to have multiple POPs components'
        }
      ])
    })
  })
})
