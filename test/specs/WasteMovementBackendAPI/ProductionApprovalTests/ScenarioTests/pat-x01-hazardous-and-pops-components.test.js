import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Production Approval Test X01 - Hazardous and POPs Components', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-180', 'DWTA-180', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for X01', () => {
    it('should pass when a waste movement is supplied with hazardous and POPs components', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121']
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.wasteItems[0].containsPops = true
      wasteReceiptData.wasteItems[0].pops = {
        sourceOfComponents: 'OWN_TESTING',
        components: [
          {
            code: 'HBB',
            concentration: 2.5
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'X01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'X01',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for X01', () => {
    it('should fail when a waste item is supplied with POPs components but no hazardous components', async () => {
      wasteReceiptData.wasteItems[0].containsPops = true
      wasteReceiptData.wasteItems[0].pops = {
        sourceOfComponents: 'OWN_TESTING',
        components: [
          {
            code: 'HBB',
            concentration: 2.5
          }
        ]
      }
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
          [{ scenarioId: 'X01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'X01',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected one or more waste items to have POPs and Hazardous components'
        }
      ])
    })

    it('should fail when a waste item is supplied with hazardous components but no POPs components', async () => {
      wasteReceiptData.wasteItems[0].ewcCodes = ['200121']
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      wasteReceiptData.hazardousWasteConsignmentCode = 'CJTILE/A0001'
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
          [{ scenarioId: 'X01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'X01',
          wasteTrackingId,
          status: 'Fail',
          message:
            'Expected one or more waste items to have POPs and Hazardous components'
        }
      ])
    })
  })
})
