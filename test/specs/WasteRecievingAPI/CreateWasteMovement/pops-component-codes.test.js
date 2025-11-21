import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('POPs Component Codes Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-346', 'DWT-346', 'jira')
    await addAllureLink('/DWT-938', 'DWT-938', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    wasteReceiptData.wasteItems[0].containsPops = true
    wasteReceiptData.wasteItems[0].pops = {
      components: [
        {
          code: 'SCCPS',
          concentration: 2.5
        }
      ]
    }

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid POPs Component Codes', () => {
    it(
      'should accept waste containing an allowed POPs component code for "Hexabromobiphenyl" : "HBB"' +
        ' @allure.label.tag:DWT-346' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components[0].code = 'HBB'
        wasteReceiptData.wasteItems[0].pops.sourceOfComponents =
          'PROVIDED_WITH_WASTE'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String)
        })
      }
    )

    it(
      'should accept waste containing multiple POPs component' +
        ' @allure.label.tag:DWT-346',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components.push({
          code: 'CHL',
          concentration: 2.0
        })
        wasteReceiptData.wasteItems[0].pops.sourceOfComponents = 'OWN_TESTING'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String)
        })
      }
    )
  })

  describe('Invalid POPs Component Codes', () => {
    // pop component name is a mandatory field
    it(
      'should reject waste submission when the POP component code is an empty string' +
        ' @allure.label.tag:DWT-623' +
        ' @allure.label.tag:DWT-938',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components[0].code = ''
        wasteReceiptData.wasteItems[0].pops.sourceOfComponents = 'GUIDANCE'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components.0.code',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.components[0].code" is not allowed to be empty'
              }
            ]
          }
        })
      }
    )
    it(
      'should reject waste submission containing POPs components when it is not required' +
        ' @allure.label.tag:DWT-346' +
        ' @allure.label.tag:DWT-353',
      async () => {
        wasteReceiptData.wasteItems[0].containsPops = false

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.components" must not be provided when containsPops is false'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste submission containing POPs components when given a value that is not from allowed list' +
        ' @allure.label.tag:DWT-346' +
        ' @allure.label.tag:DWT-938',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components[0].code = 'ChlordaneXYZ'
        wasteReceiptData.wasteItems[0].pops.sourceOfComponents = 'OWN_TESTING'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components.0.code',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.components[0].code" contains an invalid POP code'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste submission containing POPs components code is omitted i.e. is null' +
        ' @allure.label.tag:DWT-623' +
        ' @allure.label.tag:DWT-938',
      async () => {
        delete wasteReceiptData.wasteItems[0].pops.components[0].code
        wasteReceiptData.wasteItems[0].pops.sourceOfComponents =
          'PROVIDED_WITH_WASTE'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components.0.code',
                errorType: 'NotProvided',
                message: '"wasteItems[0].pops.components[0].code" is required'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste containing multiple POPs component, if one of the components is not from the allowed list' +
        ' @allure.label.tag:DWT-623' +
        ' @allure.label.tag:DWT-938',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components.push({
          code: 'ChlordaneXYZ',
          concentration: 2.0
        })
        wasteReceiptData.wasteItems[0].pops.sourceOfComponents = 'OWN_TESTING'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components.1.code',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.components[1].code" contains an invalid POP code'
              }
            ]
          }
        })
      }
    )
  })
})
