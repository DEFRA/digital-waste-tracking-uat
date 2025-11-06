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

  describe('Valid Site IDs', () => {
    it('should accept waste movement receipt for an valid organisation API ID', async () => {
      wasteReceiptData.apiCode = 'c1611aa6-e1ae-487f-9768-cb2b5e5b8afb'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })
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
                errorType: 'UnexpectedError',
                message: 'the API Code supplied is invalid'
              }
            ]
          }
        })
      }
    )
  })
})
