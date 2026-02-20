import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('@smoke - Retry audit log', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-1326', 'DWT-1326', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('When retrying audit log for an existing movement', () => {
    it('should return 200 when retry-audit-log is invoked for a created movement @allure.label.tag:DWT-1326', async () => {
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)

      const wasteTrackingId = createResponse.json.wasteTrackingId
      const retryAuditLogResponse =
        await globalThis.apis.wasteMovementBackendAPI.retryAuditLog({
          wasteTrackingId,
          revision: 1
        })

      expect(retryAuditLogResponse.statusCode).toBe(200)
    })
  })
})
