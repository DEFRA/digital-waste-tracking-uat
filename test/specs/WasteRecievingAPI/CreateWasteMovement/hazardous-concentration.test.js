import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Hazardous Component Concentration Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-354', 'DWT-354', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Concentration Values', () => {
    it(
      'should accept waste with valid concentration value' +
        ' @allure.label.tag:DWT-354',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Mercury',
              concentration: 5.5
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
          globalMovementId: expect.any(String)
        })
      }
    )

    it(
      'should accept waste with zero concentration value' +
        ' @allure.label.tag:DWT-354',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Mercury',
              concentration: 0
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
          globalMovementId: expect.any(String)
        })
      }
    )
  })

  describe('Invalid Concentration Values', () => {
    it(
      'should reject waste with components supplied if source of components is NOT_PROVIDED' +
        ' @allure.label.tag:DWT-354' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'NOT_PROVIDED',
          components: [
            {
              name: 'Mercury'
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
                key: 'wasteItems.0.hazardous',
                errorType: 'UnexpectedError',
                message:
                  'Hazardous components must not be provided when the source of components is NOT_PROVIDED'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste with negative concentration value' +
        ' @allure.label.tag:DWT-354',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Mercury',
              concentration: -10
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
                key: 'wasteItems.0.hazardous.components.0.concentration',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].hazardous.components[0].concentration" concentration cannot be negative'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste with non-numeric concentration value' +
        ' @allure.label.tag:DWT-354',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Mercury',
              concentration: 'invalid'
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
                key: 'wasteItems.0.hazardous.components.0.concentration',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].hazardous.components[0].concentration" must be a valid number'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste with concentration provided for non-hazardous waste' +
        ' @allure.label.tag:DWT-354',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: false,
          sourceOfComponents: 'NOT_PROVIDED',
          components: [
            {
              name: 'Mercury',
              concentration: 50
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
                key: 'wasteItems.0.hazardous',
                errorType: 'UnexpectedError',
                message:
                  'Hazardous components must not be provided when Hazardous components are not present'
              }
            ]
          }
        })
      }
    )
  })

  describe('Concentration Warnings', () => {
    it(
      'should accept waste with no concentration value but show warning if source of components is CARRIER_PROVIDED or OWN_TESTING or GUIDANCE' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Mercury'
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
                key: 'wasteItems[0].hazardous.components',
                errorType: 'NotProvided',
                message:
                  'Hazardous concentration is recommended when source of components is one of CARRIER_PROVIDED, GUIDANCE, OWN_TESTING'
              }
            ]
          }
        })
      }
    )
  })
})
