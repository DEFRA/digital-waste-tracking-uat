import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Receipt details validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-547', 'DWT-547', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should not allow waste movement to be created when receipt details are missing' +
      ' @allure.label.tag:DWT-547',
    async () => {
      delete wasteReceiptData.receipt

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receipt',
              errorType: 'NotProvided',
              message: '"Receipt" is required'
            }
          ]
        }
      })
    }
  )

  describe('Waste movement must be successfully created when a valid UK postcode is provided for receipt address', () => {
    it(
      'should allow waste movement to be created when a valid UK postcode is provided for receipt address' +
        ' @allure.label.tag:DWT-547',
      async () => {
        wasteReceiptData.receipt.address.postcode = 'BS1 4XE'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )
  })

  describe('Waste movement must not be created when an invalid postcode is provided for receipt address', () => {
    it(
      'should not allow waste movement to be created when postcode contains invalid characters' +
        ' @allure.label.tag:DWT-547',
      async () => {
        wasteReceiptData.receipt.address.postcode = 'xxx'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receipt.address.postcode',
                errorType: 'UnexpectedError',
                message: 'Postcode must be in valid UK format'
              }
            ]
          }
        })
      }
    )

    it(
      'should not allow waste movement to be created when postcode contains no spaces' +
        ' @allure.label.tag:DWT-547',
      async () => {
        wasteReceiptData.receipt.address.postcode = 'BS14XE'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receipt.address.postcode',
                errorType: 'UnexpectedError',
                message: 'Postcode must be in valid UK format'
              }
            ]
          }
        })
      }
    )

    it(
      'should not allow waste movement to be created when Ireland postcode is provided' +
        ' @allure.label.tag:DWT-547',
      async () => {
        wasteReceiptData.receipt.address.postcode = 'D08 AC98'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receipt.address.postcode',
                errorType: 'UnexpectedError',
                message: 'Postcode must be in valid UK format'
              }
            ]
          }
        })
      }
    )
  })
})
