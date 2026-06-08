import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('GIO Org Exclude List', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-204', 'DWTA-204', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Updates', () => {
    it(
      'should successfully update a waste movement when the organisation is in the GIO org exclude list' +
        ' @allure.label.tag:DWTA-204',
      async () => {
        wasteReceiptData.apiCode =
          globalThis.testConfig.apiCodeInGioOrgExcludeList

        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(createResponse.statusCode).toBe(201)

        const wasteTrackingId = createResponse.json.wasteTrackingId

        const updatedData = generateBaseWasteReceiptData()
        updatedData.apiCode = globalThis.testConfig.apiCodeInGioOrgExcludeList
        updatedData.wasteItems[0].disposalOrRecoveryCodes = [
          {
            code: 'D1',
            weight: {
              metric: 'Tonnes',
              amount: 3.0,
              isEstimate: false
            }
          }
        ]

        const updateResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
            wasteTrackingId,
            updatedData
          )

        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.json).toEqual({})
      }
    )
  })
})
