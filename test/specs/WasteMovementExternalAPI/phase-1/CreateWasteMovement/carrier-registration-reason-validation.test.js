import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../../support/helpers/auth.js'
import { addAllureLink } from '../../../../support/helpers/allure-api-logger.js'

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
        wasteReceiptData.carrier.reasonForNoRegistrationNumber = 'ON_SITE'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept piped waste movement with null registration number and reason FIXED_CONVEYANCE' +
        ' @allure.label.tag:DWTC-259',
      async () => {
        await addAllureLink('/DWTC-259', 'DWTC-259', 'jira')
        wasteReceiptData.carrier.registrationNumber = null
        wasteReceiptData.carrier.reasonForNoRegistrationNumber =
          'FIXED_CONVEYANCE'
        wasteReceiptData.carrier.meansOfTransport = 'Piped'
        delete wasteReceiptData.carrier.vehicleRegistration
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )
  })

  describe('Warning must be returned wheh reasonForNoRegistrationNumber is null or blank', () => {
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
        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String),
          validation: {
            warnings: [
              {
                key: 'carrier.reasonForNoRegistrationNumber',
                errorType: 'NotProvided',
                message:
                  'carrier.reasonForNoRegistrationNumber must be one of: ON_SITE, HOUSEHOLD, ONE_OFF, MARINE, FIXED_CONVEYANCE'
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
        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String),
          validation: {
            warnings: [
              {
                key: 'carrier.reasonForNoRegistrationNumber',
                errorType: 'NotProvided',
                message:
                  'carrier.reasonForNoRegistrationNumber must be one of: ON_SITE, HOUSEHOLD, ONE_OFF, MARINE, FIXED_CONVEYANCE'
              }
            ]
          }
        })
      }
    )
  })

  describe('Invalid Registration Reason Scenarios', () => {
    it(
      'should reject waste movement with null registration number and a reason that is not one of the allowed values' +
        ' @allure.label.tag:DWT-1086',
      async () => {
        wasteReceiptData.carrier.registrationNumber = null
        wasteReceiptData.carrier.reasonForNoRegistrationNumber = 'TEST'
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
                errorType: 'InvalidValue',
                message:
                  '"carrier.reasonForNoRegistrationNumber" must be one of: ON_SITE, HOUSEHOLD, ONE_OFF, MARINE, FIXED_CONVEYANCE'
              }
            ]
          }
        })
      }
    )
  })
})
