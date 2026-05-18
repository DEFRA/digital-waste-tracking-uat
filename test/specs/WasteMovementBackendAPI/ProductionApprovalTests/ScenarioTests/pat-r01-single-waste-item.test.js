import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Production Approval Test R01 - Single Waste Item', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-166', 'DWTA-166', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Passed automated assessment for R01', () => {
    it('should pass when a waste movement has one waste item with disposal or recovery codes, no hazardous waste, and no POPs components', async () => {
      expect(wasteReceiptData.wasteItems.length).toBe(1)
      expect(wasteReceiptData.wasteItems[0].containsHazardous).toBe(false)
      expect(wasteReceiptData.wasteItems[0].containsPops).toBe(false)
      expect(
        wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes.length
      ).toBeGreaterThan(0)

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R01',
          wasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })

  describe('Failed automated assessment for R01', () => {
    it('should fail when a waste movement is supplied with a single waste item and no disposal or recovery codes', async () => {
      delete wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R01',
          wasteTrackingId,
          status: 'Fail',
          message: 'No disposal or recovery code provided'
        }
      ])
    })

    it('should fail when a waste movement is supplied with multiple waste items', async () => {
      const first = wasteReceiptData.wasteItems[0]
      wasteReceiptData.wasteItems = [first, { ...first }]

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R01',
          wasteTrackingId,
          status: 'Fail',
          message: 'Multiple waste items provided'
        }
      ])
    })

    it('should fail when a waste movement is supplied with POPs components on the waste item', async () => {
      wasteReceiptData.wasteItems[0].containsPops = true
      wasteReceiptData.wasteItems[0].pops = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [
          {
            code: 'HBB',
            concentration: 2.5
          }
        ]
      }

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R01',
          wasteTrackingId,
          status: 'Fail',
          message: expect.stringMatching(/POPs components provided/i)
        }
      ])
    })

    it('should fail when a waste movement is supplied with a hazardous waste item', async () => {
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED',
        hazCodes: ['HP_6']
      }

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R01', wasteTrackingId }]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R01',
          wasteTrackingId,
          status: 'Fail',
          message: expect.stringMatching(/hazardous waste items provided/i)
        }
      ])
    })
  })
})
