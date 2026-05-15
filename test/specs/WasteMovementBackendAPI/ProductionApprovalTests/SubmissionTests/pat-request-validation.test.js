import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
describe('Production Approval Tests Request Validation', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-177', 'DWTA-177', 'jira')
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Invalid request body', () => {
    it('should reject an empty production approval tests array', async () => {
      const response =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          []
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'ProductionApprovalTestRequest',
              errorType: 'OutOfRange',
              message:
                '"ProductionApprovalTestRequest" must contain at least 1 items'
            }
          ]
        }
      })
    })

    it('should reject a blank waste tracking id', async () => {
      const response =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R01', wasteTrackingId: '' }]
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: '0.wasteTrackingId',
              errorType: 'InvalidValue',
              message: '"[0].wasteTrackingId" is not allowed to be empty'
            }
          ]
        }
      })
    })

    it('should reject a scenario id that does not exist', async () => {
      const wasteReceiptData = generateBaseWasteReceiptData()
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)
      expect(createResponse.json).toHaveProperty('wasteTrackingId')
      const wasteTrackingId = createResponse.json.wasteTrackingId

      const response =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [{ scenarioId: 'R11', wasteTrackingId }]
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: '0.scenarioId',
              errorType: 'InvalidValue',
              message:
                '"[0].scenarioId" must be one of [R01, R02, R03, R04, R05, R07, C02, B01, P01, H01, H03, X01]'
            }
          ]
        }
      })
    })

    it('should reject duplicate scenario ids in the same request', async () => {
      const firstMovementData = generateBaseWasteReceiptData()
      const firstCreateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          firstMovementData
        )
      expect(firstCreateResponse.statusCode).toBe(201)
      expect(firstCreateResponse.json).toHaveProperty('wasteTrackingId')
      const firstWasteTrackingId = firstCreateResponse.json.wasteTrackingId

      const secondMovementData = generateBaseWasteReceiptData()
      const secondCreateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          secondMovementData
        )
      expect(secondCreateResponse.statusCode).toBe(201)
      expect(secondCreateResponse.json).toHaveProperty('wasteTrackingId')
      const secondWasteTrackingId = secondCreateResponse.json.wasteTrackingId

      const response =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId: firstWasteTrackingId },
            { scenarioId: 'R01', wasteTrackingId: secondWasteTrackingId }
          ]
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'ProductionApprovalTestRequest',
              errorType: 'InvalidValue',
              message:
                '"ProductionApprovalTestRequest" contains a duplicate scenarioId value'
            }
          ]
        }
      })
    })
  })
})
