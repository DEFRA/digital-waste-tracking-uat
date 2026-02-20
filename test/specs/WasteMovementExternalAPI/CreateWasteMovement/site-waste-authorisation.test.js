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
        wasteReceiptData.receiver.authorisationNumber = 'PPC/A/9999999'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept waste movement with valid authorisation format for England or Wales' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumber = 'XX9999XX'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept waste movement with a valid authorisation format for Scotland' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumber = 'PPC/A/SEPA9999-9999'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept waste movement with a valid authorisation format for Northern Ireland' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumber = 'WPPC 99/99'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    // this test is obsolete after DWT-578 changes
    it.skip(
      'should accept waste movement with any string as the authorisation format' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumber =
          'Not An Authorisation Format'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )
  })

  describe('Invalid Site Waste Authorisation Scenarios', () => {
    it(
      'should reject waste movement when authorisation number is empty string' +
        ' @allure.label.tag:DWT-339',
      async () => {
        wasteReceiptData.receiver.authorisationNumber = ''
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.authorisationNumber',
                errorType: 'InvalidValue',
                message:
                  '"receiver.authorisationNumber" is not allowed to be empty'
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
        wasteReceiptData.receiver.authorisationNumber = 'WEF1234567'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.authorisationNumber',
                errorType: 'InvalidFormat',
                message:
                  '"receiver.authorisationNumber" must be in a valid UK format'
              }
            ]
          }
        })
      }
    )
  })
})
