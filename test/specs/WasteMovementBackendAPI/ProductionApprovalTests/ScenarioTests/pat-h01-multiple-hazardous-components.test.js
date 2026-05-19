import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Production Approval Test H01 - Multiple Hazardous Components', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-179', 'DWTA-179', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for H01', () => {
    it('should pass when a waste movement is supplied with multiple hazardous components', async () => {
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3', 'HP_5'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 12.5
          },
          {
            name: 'Lead',
            concentration: 5.0
          }
        ]
      }
      expect(
        wasteReceiptData.wasteItems[0].hazardous.components.length
      ).toBeGreaterThan(1)

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'H01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'H01',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for H01', () => {
    it('should fail when a waste movement is supplied with no hazardous components', async () => {
      expect(wasteReceiptData.wasteItems[0].containsHazardous).toBe(false)
      expect(wasteReceiptData.wasteItems[0]).not.toHaveProperty('hazardous')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'H01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'H01',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected one or more waste items to have multiple hazardous components'
        }
      ])
    })
  })
})
