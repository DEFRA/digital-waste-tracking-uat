import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Site Waste Authorisation Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-339', 'DWT-339', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Site Waste Authorisation Numbers', () => {
    it(
      'should accept waste movement with single valid site waste authorisation number' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumbers = ['PPC/A/9999999']
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )

    it(
      'should accept waste movement with multiple authorisation formats from different home nations' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumbers = [
          'XX9999XX', // Wales
          'HP9999XX', // England
          'PPC/A/SEPA9999-9999', // Scotland
          'WPPC 99/99' // Northern Ireland
        ]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )

    // this test is obsolete after DWT-578 changes
    it.skip(
      'should accept waste movement with any string as the authorisation format' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumbers = [
          'Not An Authorisation Format'
        ]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )
  })

  describe('Invalid Site Waste Authorisation Scenarios', () => {
    it(
      'should reject waste movement when site waste authorisation array is empty' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumbers = []
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.authorisationNumbers',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.authorisationNumbers" must contain at least 1 items'
              }
            ]
          }
        })
      }
    )
    it(
      'should reject waste movement when authorisation number is empty string' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumbers = ['']
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.authorisationNumbers.0',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.authorisationNumbers[0]" is not allowed to be empty'
              }
            ]
          }
        })
      }
    )
    it(
      'should reject waste movement when authorisation number is not in the correct format' +
        ' @allure.label.tag:DWT-578',
      async () => {
        await addAllureLink('/DWT-578', 'DWT-578', 'jira')
        wasteReceiptData.receiver.authorisationNumbers = ['WEF1234567']
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.authorisationNumbers.0',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.authorisationNumbers[0]" must be in a valid UK format'
              }
            ]
          }
        })
      }
    )
  })
})
