import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateCompleteWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Receiving site details validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-547', 'DWT-547', 'jira')
    wasteReceiptData = generateCompleteWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should allow waste movement to be created when only receiver contact details are provied' +
      ' @allure.label.tag:DWT-547',
    async () => {
      delete wasteReceiptData.receiver
      //  Note: receiver address details are provided in the receipt object

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    }
  )

  it(
    'should not allow waste movement to be created when there is no receiver contact details provided' +
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

  describe('Waste movement must be successfully created when a valid waste receiver address postcode is provided', () => {
    it.each([{ postCode: 'BS1 4XE', country: 'UK' }])(
      'should allow waste movement to be creeated when a valid $country postCode is provided for waste receiver address @allure.label.tag:DWT-547',
      async ({ postCode, country }) => {
        wasteReceiptData.receipt.address.postCode = postCode
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )
  })

  describe('Waste movement must not be created when an invalid reciever site address postcode provided', () => {
    it.each([
      { postCode: 'xxx', reason: 'is invalid' },
      { postCode: 'BS14XE', reason: 'contains no spaces' },
      { postCode: 'D08 AC98', reason: 'is an Ireland postcode' }
    ])(
      'should not allow waste movement to be created when the postCode $reason @allure.label.tag:DWT-547',
      async ({ postCode, reason }) => {
        wasteReceiptData.receipt.address.postCode = postCode
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receipt.address.postCode',
                errorType: 'UnexpectedError',
                message: 'Post Code must be in valid UK format'
              }
            ]
          }
        })
      }
    )
  })

  it(
    'should not allow waste movement to be created when an invalid email is supplied for the receiver organisation' +
      ' @allure.label.tag:DWT-547',
    async () => {
      wasteReceiptData.receiver.emailAddress = 'invalidtest@'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receiver.emailAddress',
              errorType: 'UnexpectedError',
              message: '"receiver.emailAddress" must be a valid email'
            }
          ]
        }
      })
    }
  )
})
