import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Test backend API', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-1326', 'DWT-1326', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Simple test to see if we can call the backend API From our auto tests', () => {
    it(
      'Invoke backend API retry-audit-log' + ' @allure.label.tag:DWT-1326',
      async () => {
        // First create a movement
        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(createResponse.statusCode).toBe(201)

        const wasteTrackingId = createResponse.json.wasteTrackingId
        const retryAuditLogResponse =
          await globalThis.apis.wasteMovementBackendAPI.retryAuditLog(
            globalThis.testConfig.backendPassword,
            {
              wasteTrackingId,
              revision: 1
            }
          )
        expect(retryAuditLogResponse.statusCode).toBe(200)
      }
    )
  })
})
