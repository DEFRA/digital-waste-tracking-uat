import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Receiver Authorisation Number Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Receiver Authorisation Numbers', () => {
    it(
      'should accept waste movement when receiver authorisation number uses an accepted standard licence format' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
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
      'should accept waste movement when receiver authorisation number is valid for England or Wales' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
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
      'should accept waste movement when receiver authorisation number is valid under SEPA PPC arrangements' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
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
      'should accept waste movement when receiver authorisation number is valid for Northern Ireland' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
        wasteReceiptData.receiver.authorisationNumber = 'WPPC 99/99'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept waste movement when receiver authorisation number includes an additional activity segment for SEPA receiver sites' +
        ' @allure.label.tag:DWTA-189',
      async () => {
        await addAllureLink('/DWTA-189', 'DWTA-189', 'jira')
        wasteReceiptData.receiver.authorisationNumber = 'WML/L/9999999/99'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )
  })

  describe('Invalid Receiver Authorisation Number Scenarios', () => {
    it(
      'should reject waste movement when receiver authorisation number is blank' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
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
      'should reject waste movement when receiver authorisation number is not a valid UK site authorisation number' +
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
