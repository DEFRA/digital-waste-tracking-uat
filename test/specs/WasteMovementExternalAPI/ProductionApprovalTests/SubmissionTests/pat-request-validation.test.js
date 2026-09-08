import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Production Approval Tests Request Validation', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-295', 'DWTA-295', 'jira')
    await addAllureLink('/DWTA-177', 'DWTA-177', 'jira')
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Invalid request body', () => {
    it('should reject an empty production approval tests array @allure.label.tag:DWTA-295', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
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

    it('should reject a blank waste tracking id @allure.label.tag:DWTA-295', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
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

    it('should reject non-existent waste tracking ids @allure.label.tag:DWTA-295', async () => {
      const firstNonExistentWasteTrackingId = 'NONEXISTENT01'
      const secondNonExistentWasteTrackingId = 'NONEXISTENT02'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
          [
            {
              scenarioId: 'R01',
              wasteTrackingId: firstNonExistentWasteTrackingId
            },
            {
              scenarioId: 'R02',
              wasteTrackingId: secondNonExistentWasteTrackingId
            }
          ]
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteTrackingId',
              errorType: 'InvalidValue',
              message: `Could not find waste input(s) for the following id(s): ${firstNonExistentWasteTrackingId}, ${secondNonExistentWasteTrackingId}`
            }
          ]
        }
      })
    })

    it('should reject a scenario id that does not exist @allure.label.tag:DWTA-295', async () => {
      const wasteReceiptData = generateBaseWasteReceiptData()
      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
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

    it('should reject duplicate scenario ids in the same request @allure.label.tag:DWTA-295', async () => {
      const firstMovementData = generateBaseWasteReceiptData()
      const firstWasteTrackingId =
        await createMovementAndGetWasteTrackingId(firstMovementData)

      const secondMovementData = generateBaseWasteReceiptData()
      const secondWasteTrackingId =
        await createMovementAndGetWasteTrackingId(secondMovementData)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
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
