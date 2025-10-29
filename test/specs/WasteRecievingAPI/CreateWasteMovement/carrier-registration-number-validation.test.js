import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Carrier Registration Number Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-326', 'DWT-326', 'jira')
    await addAllureLink('/DWT-576', 'DWT-576', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Carrier Registration Numbers', () => {
    it(
      'should accept waste movement with valid carrier registration number for England and Wales' +
        ' @allure.label.tag:DWT-326 @allure.label.tag:DWT-576',
      async () => {
        wasteReceiptData.carrier.registrationNumber = 'CBDL999999'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )
    it(
      'should accept waste movement with valid carrier registration number for Scotland' +
        ' @allure.label.tag:DWT-326 @allure.label.tag:DWT-576',
      async () => {
        wasteReceiptData.carrier.registrationNumber = 'wcr/r/1234567'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )
    it(
      'should accept waste movement with valid carrier registration number for Northern Ireland' +
        ' @allure.label.tag:DWT-326 @allure.label.tag:DWT-576',
      async () => {
        wasteReceiptData.carrier.registrationNumber = 'ROC UT 99999'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
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
                key: 'carrier.reasonForNoRegistrationNumber',
                errorType: 'NotProvided',
                message: '"carrier.reasonForNoRegistrationNumber" is required'
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
                key: 'carrier.reasonForNoRegistrationNumber',
                errorType: 'NotProvided',
                message: '"carrier.reasonForNoRegistrationNumber" is required'
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
                key: 'carrier.registrationNumber',
                errorType: 'NotProvided',
                message: '"carrier.registrationNumber" is required'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement when registration number format is invalid' +
        ' @allure.label.tag:DWT-576',
      async () => {
        wasteReceiptData.carrier.registrationNumber = 'CBDL99'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier.registrationNumber',
                errorType: 'UnexpectedError',
                message:
                  '"carrier.registrationNumber" must be in a valid England, SEPA, NRW or NI format'
              }
            ]
          }
        })
      }
    )
  })
})
