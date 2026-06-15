import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('@prod-smoke - GIO Org Exclude List', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-204', 'DWTA-204', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it(
      'should successfully create a waste movement when the organisation is in the GIO org exclude list' +
        ' @allure.label.tag:DWTA-204',
      async () => {
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String)
        })
      }
    )
  })
})
