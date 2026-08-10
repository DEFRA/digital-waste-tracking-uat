import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Organisation API ID Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Invalid Organisation API IDs', () => {
    it('should reject waste movement receipt with missing organisation API ID', async () => {
      delete wasteReceiptData.apiCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'apiCode',
              errorType: 'NotProvided',
              message: '"apiCode" is required'
            }
          ]
        }
      })
    })
    it(
      'should reject waste movement receipt with API code that is not from allowed list' +
        ' @allure.label.tag:DWT-910',
      async () => {
        await addAllureLink('/DWT-910', 'DWT-910', 'jira')
        wasteReceiptData.apiCode = 'dd4ce599-2fb3-4554-b249-35edf9408265'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'apiCode',
                errorType: 'InvalidValue',
                message: 'the API Code supplied is invalid'
              }
            ]
          }
        })
      }
    )
  })
})
