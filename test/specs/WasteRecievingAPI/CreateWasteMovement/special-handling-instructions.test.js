import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Special Handling Instructions Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-323', 'DWT-323', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Special Handling Instructions', () => {
    describe('Standard Instructions', () => {
      it('should successfully create a new waste movement with valid special handling instructions @allure.label.tag:DWT-323', async () => {
        wasteReceiptData.specialHandlingRequirements =
          'The waste must be fully inspected by the waste handler according to the Hazardous waste consignment and or EWC codes provided.'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toEqual({
          statusCode: 200,
          globalMovementId: expect.any(String)
        })
      })
    })
  })

  describe('Invalid Special Handling Instructions', () => {
    describe('Field Length Validation', () => {
      it('should successfully reject waste movement creation when the length of data entered in special handling instructions exceeds 5000 @allure.label.tag:DWT-323', async () => {
        wasteReceiptData.specialHandlingRequirements =
          'The waste must be fully inspected by the waste handler according to the Hazardous waste consignment and or EWC codes provided.'.repeat(
            100
          )

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'specialHandlingRequirements',
                errorType: 'UnexpectedError',
                message:
                  '"specialHandlingRequirements" length must be less than or equal to 5000 characters long'
              }
            ]
          }
        })
      })
    })
  })
})
