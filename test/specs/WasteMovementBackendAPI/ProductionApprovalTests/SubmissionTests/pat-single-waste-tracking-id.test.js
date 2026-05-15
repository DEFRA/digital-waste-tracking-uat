import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
describe('Production Approval Tests With a Single Waste Tracking Id', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-177', 'DWTA-177', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Multiple scenarios assessed against one movement', () => {
    it('should return mixed R01 and R02 results for a single waste item movement', async () => {
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId }
          ]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
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
      ])
    })

    it('should return mixed R01 and R02 results for a multiple waste item movement', async () => {
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
          [
            { scenarioId: 'R01', wasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId }
          ]
        )
      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
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
      ])
    })
  })
})
