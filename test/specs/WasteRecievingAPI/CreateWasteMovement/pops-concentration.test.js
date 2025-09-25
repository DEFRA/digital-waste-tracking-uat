import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('POPs Component Concentration Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-353', 'DWT-353', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )

    wasteReceiptData.wasteItems[0].pops = {
      containsPops: true,
      sourceOfComponents: 'CARRIER_PROVIDED',
      components: [
        {
          name: 'Aldrin',
          concentration: 5.5
        }
      ]
    }
  })

  describe('Valid Concentration Values', () => {
    it(
      'should accept waste with valid pops concentration value' +
        ' @allure.label.tag:DWT-353',
      async () => {
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toEqual({
          statusCode: 200,
          globalMovementId: expect.any(String)
        })
      }
    )

    it(
      'should accept waste with pops containing zero concentration value' +
        ' @allure.label.tag:DWT-353',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components[0].concentration = 0

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toEqual({
          statusCode: 200,
          globalMovementId: expect.any(String)
        })
      }
    )
  })

  describe('Invalid Concentration Values', () => {
    it(
      'should reject waste with missing concentration value if source of components is NOT_PROVIDED' +
        ' @allure.label.tag:DWT-353' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].pops = {
          containsPops: true,
          sourceOfComponents: 'NOT_PROVIDED',
          components: [
            {
              name: 'Aldrin'
              // Missing concentration field
            }
          ]
        }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops',
                errorType: 'UnexpectedError',
                message:
                  'POP components must not be provided when the source of components is NOT_PROVIDED'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste with pops containing negative concentration value' +
        ' @allure.label.tag:DWT-353',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components[0].concentration = -10

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components.0.concentration',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.components[0].concentration" concentration cannot be negative'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste with pops containing non-numeric concentration value' +
        ' @allure.label.tag:DWT-353',
      async () => {
        wasteReceiptData.wasteItems[0].pops.components[0].concentration = 'abc'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops.components.0.concentration',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.components[0].concentration" must be a valid number'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste with concentration provided for non-hazardous waste' +
        ' @allure.label.tag:DWT-353',
      async () => {
        wasteReceiptData.wasteItems[0].pops.containsPops = false
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.pops',
                errorType: 'UnexpectedError',
                message:
                  'POP components must not be provided when POPs are not present'
              }
            ]
          }
        })
      }
    )
  })

  describe('Concentration Warnings', () => {
    it(
      'should accept waste with no concentration value but show warning if source of components is CARRIER_PROVIDED or OWN_TESTING or GUIDANCE or GUIDANCE' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].pops = {
          containsPops: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Aldrin'
              // concentration: ''
            }
          ]
        }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toEqual({
          statusCode: 200,
          globalMovementId: expect.any(String),
          validation: {
            warnings: [
              {
                key: 'wasteItems[0].pops.components',
                errorType: 'NotProvided',
                message:
                  'POP concentration is recommended when source of components is one of CARRIER_PROVIDED, GUIDANCE, OWN_TESTING'
              }
            ]
          }
        })
      }
    )
  })
})
