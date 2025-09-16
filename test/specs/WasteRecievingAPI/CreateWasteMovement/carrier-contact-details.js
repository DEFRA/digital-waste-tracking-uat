import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Carrier Contact Details Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-342', 'DWT-342', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    wasteReceiptData.carrier = {
    organisationName: 'Test Carrier Ltd',
    address: {
      fullAddress: '123 Test Street, Test City',
      postcode: 'TC1 2AB'
    },
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890',
    meansOfTransport: 'Road',
    registrationNumber: 'REG123456',
    vehicleRegistration: 'AB12 CDE'
  }

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should allow waste movement to be created when carrier has minimal required fields' +
      ' @allure.label.tag:DWT-342',
    async () => {
      wasteReceiptData.carrier = {
        organisationName: 'Test Carrier Ltd',
        meansOfTransport: 'Road',
        vehicleRegistration: 'AB12 CDE',
        registrationNumber: 'REG123456'
      }
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    }
  )

  it(
    'should not allow waste movement to be created when there is no carrier organisation name provided' +
      ' @allure.label.tag:DWT-342',
    async () => {
      delete wasteReceiptData.carrier.organisationName
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.organisationName',
              errorType: 'NotProvided',
              message: '"carrier.organisationName" is required'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created when there is no postcode supplied for the carrier organisation' +
      ' @allure.label.tag:DWT-342',
    async () => {
      delete wasteReceiptData.carrier.address.postcode
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.address.postcode',
              errorType: 'NotProvided',
              message: '"carrier.address.postcode" is required'
            }
          ]
        }
      })
    }
  )

  describe('Validate the carrier postcode', () => {
    it.each([
      { postcode: 'D08 AC98', isValid: true, expected: 'created' },
      { postcode: 'BS1 4XE', isValid: true, expected: 'created' },
      { postcode: 'xxx', isValid: false, expected: 'not created' },
      { postcode: 'BS14XE', isValid: false, expected: 'not created' } // postcode without spaces is not being allowed
    ])(
      'should allow waste movement to be $expected when the postcode is "$postcode" @allure.label.tag:DWT-342',
      async ({ postcode, isValid, expected }) => {
        wasteReceiptData.carrier.address.postcode = postcode
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
                  key: 'carrier.address.postcode',
                  errorType: 'UnexpectedError',
                  message: 'Postcode must be in valid UK or Ireland format'
                }
              ]
            }
          })
        }
      }
    )
  })

  it(
    'should not allow waste movement to be created when an invalid email is supplied for the carrier organisation' +
      ' @allure.label.tag:DWT-342',
    async () => {
      wasteReceiptData.carrier.emailAddress = 'invalidtest@'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.emailAddress',
              errorType: 'UnexpectedError',
              message: '"carrier.emailAddress" must be a valid email'
            }
          ]
        }
      })
    }
  )
})
