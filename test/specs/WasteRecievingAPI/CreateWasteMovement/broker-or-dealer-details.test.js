import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Broker or Dealer Details Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-343', 'DWT-343', 'jira')
    await addAllureLink('/DWT-577', 'DWT-577', 'jira')
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

  describe('Valid Broker or Dealer Details', () => {
    describe('Organisation Name Only', () => {
      it('should accept waste movement with only broker or dealer organisation name provided @allure.label.tag:DWT-343', async () => {
        wasteReceiptData.brokerOrDealer.organisationName = 'Test Broker Ltd'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      })
    })

    describe('Valid Postcodes', () => {
      it('should accept waste movement with valid Ireland postcode @allure.label.tag:DWT-343', async () => {
        wasteReceiptData.brokerOrDealer.address.postcode = 'D08 AC98'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      })

      it('should accept waste movement with valid UK postcode @allure.label.tag:DWT-343', async () => {
        wasteReceiptData.brokerOrDealer.address.postcode = 'BS1 4XE'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      })
    })

    describe('Valid Registration Numbers', () => {
      it(
        'should accept waste movement with valid broker or dealer registration number for England and Wales' +
          ' @allure.label.tag:DWT-326 @allure.label.tag:DWT-576',
        async () => {
          wasteReceiptData.brokerOrDealer.registrationNumber = 'CBDL999999'
          const response =
            await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
              wasteReceiptData
            )
          expect(response.statusCode).toBe(200)
          expect(response.json).toHaveProperty('globalMovementId')
        }
      )
      it('should accept waste movement with valid Scotland registration number @allure.label.tag:DWT-338', async () => {
        //  Note: Currently there is no validation on the registration number and any string is being allowed
        wasteReceiptData.brokerOrDealer.registrationNumber = 'WCR/R/1234567'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
      })
      it(
        'should accept waste movement with valid broker or dealer registration number for Northern Ireland' +
          ' @allure.label.tag:DWT-326 @allure.label.tag:DWT-576',
        async () => {
          wasteReceiptData.brokerOrDealer.registrationNumber = 'ROC LT 9999'
          const response =
            await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
              wasteReceiptData
            )
          expect(response.statusCode).toBe(200)
          expect(response.json).toHaveProperty('globalMovementId')
        }
      )
    })
  })

  describe('Invalid Broker or Dealer Details', () => {
    describe('Missing Organisation Name', () => {
      it('should reject waste movement when organisation name is missing but other fields are provided @allure.label.tag:DWT-577', async () => {
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
      })
    })

    describe('Registration Number in incorrect format', () => {
      it('should reject waste movement when registration number is in incorrect format for broker or dealer @allure.label.tag:DWT-577', async () => {
        wasteReceiptData.brokerOrDealer.registrationNumber = 'RO C LT 999'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'brokerOrDealer.registrationNumber',
                errorType: 'UnexpectedError',
                message:
                  '"brokerOrDealer.registrationNumber" must be in a valid England, SEPA, NRW or NI format'
              }
            ]
          }
        })
      })
    })

    describe('Missing Address Details', () => {
      it('should reject waste movement when postcode is missing for broker or dealer organisation @allure.label.tag:DWT-343', async () => {
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
      })
    })

    describe('Invalid Postcodes', () => {
      it('should reject waste movement when postcode is invalid @allure.label.tag:DWT-343', async () => {
        wasteReceiptData.brokerOrDealer.address.postcode = 'xxx'
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
                message:
                  '"brokerOrDealer.address.postcode" must be in valid UK or Ireland format'
              }
            ]
          }
        })
      })

      it('should reject waste movement when postcode contains no spaces @allure.label.tag:DWT-343', async () => {
        wasteReceiptData.brokerOrDealer.address.postcode = 'BS14XE'
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
                message:
                  '"brokerOrDealer.address.postcode" must be in valid UK or Ireland format'
              }
            ]
          }
        })
      })
    })

    describe('Invalid Email Addresses', () => {
      it('should reject waste movement when invalid email is supplied for broker or dealer organisation @allure.label.tag:DWT-343', async () => {
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
      })
    })
  })
})
