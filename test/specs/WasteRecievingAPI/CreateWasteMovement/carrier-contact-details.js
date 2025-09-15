import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateCompleteWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Carrier Contact Details Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-342', 'DWT-342', 'jira')
    wasteReceiptData = generateCompleteWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should allow waste movement to be created when there is only carrier organisation name provided' +
      ' @allure.label.tag:DWT-342',
    async () => {
      wasteReceiptData.carrier = {
        organisationName: 'Test Carrier Ltd'
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
      delete wasteReceiptData.carrier.address.postCode
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.address.postCode',
              errorType: 'NotProvided',
              message: '"carrier.address.postCode" is required'
            }
          ]
        }
      })
    }
  )

  describe('Validate the carrier postcode', () => {
    it.each([
      { postCode: 'D08 AC98', isValid: true, expected: 'created' },
      { postCode: 'BS1 4XE', isValid: true, expected: 'created' },
      { postCode: 'xxx', isValid: false, expected: 'not created' },
      { postCode: 'BS14XE', isValid: false, expected: 'not created' } // postcode without spaces is not being allowed
    ])(
      'should allow waste movement to be $expected when the postCode is "$postCode" @allure.label.tag:DWT-342',
      async ({ postCode, isValid, expected }) => {
        wasteReceiptData.carrier.address.postCode = postCode
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
                  key: 'carrier.address.postCode',
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
    'should not allow waste movement to be created when an invalid email is supplied for the carrier organisation' +
      ' @allure.label.tag:DWT-342',
    async () => {
      wasteReceiptData.carrier.address.emailAddress = 'invalidtest@'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.address.emailAddress',
              errorType: 'NotAllowed',
              message: '"carrier.address.emailAddress" is not allowed'
            }
          ]
        }
      })
    }
  )
})
