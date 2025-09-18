import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Carrier Registration Number Validation', () => {
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

  describe('Valid Carrier Registration Numbers', () => {
    it(
      'should accept waste movement with valid carrier registration number' +
        ' @allure.label.tag:DWT-326',
      async () => {
        wasteReceiptData.carrier.registrationNumber = 'REG123456'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      }
    )
  })

  describe('Invalid Carrier Registration Numbers', () => {
    it(
      'should reject waste movement with blank registration number' +
        ' @allure.label.tag:DWT-326',
      async () => {
        wasteReceiptData.carrier.registrationNumber = ''
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier',
                errorType: 'UnexpectedError',
                message:
                  'Either carrier registration number or reason for no registration number is required'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement with null registration number' +
        ' @allure.label.tag:DWT-326',
      async () => {
        wasteReceiptData.carrier.registrationNumber = null
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier',
                errorType: 'UnexpectedError',
                message:
                  'Either carrier registration number or reason for no registration number is required'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement when registration number field is missing' +
        ' @allure.label.tag:DWT-326',
      async () => {
        delete wasteReceiptData.carrier.registrationNumber
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier',
                errorType: 'UnexpectedError',
                message:
                  'Either carrier registration number or reason for no registration number is required'
              }
            ]
          }
        })
      }
    )
  })
})
