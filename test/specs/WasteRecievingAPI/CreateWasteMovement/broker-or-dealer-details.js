import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Broker or dealer details Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-343', 'DWT-343', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    wasteReceiptData.brokerOrDealer = {
      organisationName: 'Test Broker Ltd',
      address: {
        fullAddress: '123 Test Street, Test City',
        postcode: 'TC1 2AB'
      }
    }

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
    'should not allow waste movement to be created when there is no broker or dealer organisation name provided and other fields are provided' +
      ' @allure.label.tag:DWT-343',
    async () => {
      delete wasteReceiptData.brokerOrDealer.organisationName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'brokerOrDealer.organisationName',
              errorType: 'NotProvided',
              message: '"brokerOrDealer.organisationName" is required'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created when there is no postcode supplied for the brokerOrDealer organisation' +
      ' @allure.label.tag:DWT-343',
    async () => {
      delete wasteReceiptData.brokerOrDealer.address.postcode
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'brokerOrDealer.address.postcode',
              errorType: 'NotProvided',
              message: '"brokerOrDealer.address.postcode" is required'
            }
          ]
        }
      })
    }
  )

  describe('Waste movement must be successfully created when a valid Broker or dealer postcode provided', () => {
    it.each([
      { postcode: 'D08 AC98', country: 'Ireland' },
      { postcode: 'BS1 4XE', country: 'UK' }
    ])(
      'should allow waste movement to be creeated when a valid $country postcode is provided @allure.label.tag:DWT-343',
      async ({ postcode, country }) => {
        wasteReceiptData.brokerOrDealer.address.postcode = postcode
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )
  })
  describe('Waste movement must not be created when an invalid Broker or dealer postcode provided', () => {
    it.each([
      { postcode: 'xxx', reason: 'is invalid' },
      { postcode: 'BS14XE', reason: 'contains no spaces' }
    ])(
      'should not allow waste movement to be created when the postcode $reason @allure.label.tag:DWT-343',
      async ({ postcode, reason }) => {
        wasteReceiptData.brokerOrDealer.address.postcode = postcode
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'brokerOrDealer.address.postcode',
                errorType: 'UnexpectedError',
                message: 'Postcode must be in valid UK or Ireland format'
              }
            ]
          }
        })
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
