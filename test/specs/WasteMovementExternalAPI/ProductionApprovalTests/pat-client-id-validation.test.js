import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe.skip('Production Approval Tests via External API - Client ID', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-295', 'DWTA-295', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Client ID ownership validation', () => {
    it(
      'should reject PAT submission when waste tracking ID belongs to a different software provider' +
        ' @allure.label.tag:DWTA-295',
      async () => {
        const wasteTrackingId =
          await createMovementAndGetWasteTrackingId(wasteReceiptData)

        await authenticateAndSetToken(
          globalThis.testConfig.cognitoClientId2,
          globalThis.testConfig.cognitoClientSecret2
        )

        const patResponse =
          await globalThis.apis.wasteMovementExternalAPI.runProductionApprovalTests(
            [{ scenarioId: 'B01', wasteTrackingId }]
          )

        expect(patResponse.statusCode).toBe(400)
        expect(patResponse.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteTrackingId',
                errorType: 'InvalidValue',
                message:
                  'One or more waste tracking ids are not valid for the client id'
              }
            ]
          }
        })
      }
    )
  })
})
