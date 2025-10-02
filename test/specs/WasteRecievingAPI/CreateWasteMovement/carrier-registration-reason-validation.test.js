import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Carrier Registration Reason Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-326', 'DWT-326', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Registration Reason Scenarios', () => {
    it(
      'should accept waste movement with null registration number and valid reason for no registration number' +
        ' @allure.label.tag:DWT-326',
      async () => {
        wasteReceiptData.carrier.registrationNumber = null
        wasteReceiptData.carrier.reasonForNoRegistrationNumber =
          'Carrier not registered'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )
  })

  describe('Invalid Registration Reason Scenarios', () => {
    it(
      'should reject waste movement with null registration number and blank reason' +
        ' @allure.label.tag:DWT-326',
      async () => {
        wasteReceiptData.carrier.registrationNumber = null
        wasteReceiptData.carrier.reasonForNoRegistrationNumber = ''
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier.reasonForNoRegistrationNumber',
                errorType: 'UnexpectedError',
                message:
                  'Either carrier.registrationNumber or carrier.reasonForNoRegistrationNumber is required'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement with null registration number and null reason' +
        ' @allure.label.tag:DWT-326',
      async () => {
        wasteReceiptData.carrier.registrationNumber = null
        wasteReceiptData.carrier.reasonForNoRegistrationNumber = null
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier.reasonForNoRegistrationNumber',
                errorType: 'UnexpectedError',
                message:
                  'Either carrier.registrationNumber or carrier.reasonForNoRegistrationNumber is required'
              }
            ]
          }
        })
      }
    )
  })
})
