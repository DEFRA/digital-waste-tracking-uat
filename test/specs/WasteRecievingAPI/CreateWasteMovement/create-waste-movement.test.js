import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Waste Movement Creation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should successfully create a new waste movement with valid data @allure.label.tag:DWT-547', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })
    it(
      'should successfully create a new waste movement with valid data-complex' +
        ' @allure.label.tag:DWT-343' +
        ' @allure.label.tag:DWT-336 allure.label.tag:DWT-547 allure.label.tag:DWT-334',
      async () => {
        await addAllureLink('/DWT-343', 'DWT-343', 'jira')
        wasteReceiptData = generateBaseWasteReceiptData()

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String)
        })
      }
    )
  })

  describe('Failed Creation', () => {
    it('should fail to create movement due to missing required fields', async () => {
      const invalidData = generateBaseWasteReceiptData()
      delete invalidData.apiCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          invalidData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: expect.any(String),
              errorType: expect.any(String),
              message: expect.any(String)
            }
          ]
        }
      })
    })
  })
})
