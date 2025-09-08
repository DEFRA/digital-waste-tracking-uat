import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateCompleteWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Broker or dealer details Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-343', 'DWT-343', 'jira')
    wasteReceiptData = generateCompleteWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should allow waste movement to be created when there is only broker or dealer organisation name provided' +
      ' @allure.label.tag:DWT-343',
    async () => {
      wasteReceiptData.brokerOrDealer.organisationName = 'Test Broker Ltd'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    }
  )

  it(
    'should allow waste movement to be created when there is no broker or dealer organisation name provided and other fields are provided' +
      ' @allure.label.tag:DWT-343',
    async () => {
      wasteReceiptData.brokerOrDealer.organisationName = undefined

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    }
  )

  it(
    'should not allow waste movement to be created when there is no postcode supplied for the brikerOrDealer organisation' +
      ' @allure.label.tag:DWT-343',
    async () => {
      delete wasteReceiptData.brokerOrDealer.address.postCode
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'brokerOrDealer.address.postCode',
              errorType: 'NotProvided',
              message: '"brokerOrDealer.address.postCode" is required'
            }
          ]
        }
      })
    }
  )

  describe('Validate the Broker or dealer postcode provided', () => {
    it.each([
      { postCode: 'BT47 6FA', isValid: true, expected: 'created' },
      { postCode: 'BS1 4XE', isValid: true, expected: 'created' },
      { postCode: 'xxx', isValid: false, expected: 'not created' },
      { postCode: 'BS14XE', isValid: false, expected: 'not created' } // postcode without spaces is not being allowed
    ])(
      'should allow waste movement to be $expected when the postCode is "$postCode" @allure.label.tag:DWT-343',
      async ({ postCode, isValid, expected }) => {
        wasteReceiptData.brokerOrDealer.address.postCode = postCode
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        if (isValid) {
          expect(response.statusCode).toBe(200)
          expect(response.json).toHaveProperty('globalMovementId')
        } else {
          expect(response.statusCode).toBe(400)
          expect(response.json).toEqual({
            validation: {
              errors: [
                {
                  key: 'brokerOrDealer.address.postCode',
                  errorType: 'UnexpectedError',
                  message: 'Post Code must be in valid UK or Ireland format'
                }
              ]
            }
          })
        }
      }
    )
  })

  it(
    'should not allow waste movement to be created when an invalid email is supplied for the broker or dealer organisation' +
      ' @allure.label.tag:DWT-343',
    async () => {
      wasteReceiptData.brokerOrDealer.address.emailAddress = 'invalidtest@'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'brokerOrDealer.address.emailAddress',
              errorType: 'NotAllowed',
              message: '"brokerOrDealer.address.emailAddress" is not allowed'
            }
          ]
        }
      })
    }
  )
})
