import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Waste Weight Estimate Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-331', 'DWT-331', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Weight Estimate Indicators', () => {
    it.each([
      [true, 'an estimate'],
      [false, 'not an estimate']
    ])(
      'should accept weight estimate indicator: %s (%s)' +
        ' @allure.label.tag:DWT-331',
      async (isEstimate, description) => {
        wasteReceiptData.wasteItems[0].weight.isEstimate = isEstimate

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

  describe('Invalid Weight Estimate Indicators', () => {
    it(
      'should reject missing weight estimate indicator' +
        ' @allure.label.tag:DWT-331',
      async () => {
        delete wasteReceiptData.wasteItems[0].weight.isEstimate

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.weight.isEstimate',
                errorType: 'NotProvided',
                message: '"wasteItems[0].weight.isEstimate" is required'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject invalid weight estimate indicator' +
        ' @allure.label.tag:DWT-331',
      async () => {
        wasteReceiptData.wasteItems[0].weight.isEstimate = 'invalid'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.weight.isEstimate',
                errorType: 'UnexpectedError',
                message: '"wasteItems[0].weight.isEstimate" must be a boolean'
              }
            ]
          }
        })
      }
    )
  })

  describe(' weight estimate indicator validations for weight object in "disposalOrRecoveryCodes" array', () => {
    describe('Valid Weight Estimate Indicators', () => {
      it.each([
        [true, 'an estimate'],
        [false, 'not an estimate']
      ])(
        'should accept weight estimate indicator: %s (%s)' +
          ' @allure.label.tag:DWT-331',
        async (isEstimate, description) => {
          wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate =
            isEstimate

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

    describe('Invalid Weight Estimate Indicators', () => {
      it(
        'should reject missing weight estimate indicator' +
          ' @allure.label.tag:DWT-331',
        async () => {
          delete wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes[0]
            .weight.isEstimate

          const response =
            await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
              wasteReceiptData
            )

          expect(response.statusCode).toBe(400)
          expect(response.json).toEqual({
            validation: {
              errors: [
                {
                  key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.isEstimate',
                  errorType: 'NotProvided',
                  message:
                    '"wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate" is required'
                }
              ]
            }
          })
        }
      )

      it(
        'should reject invalid weight estimate indicator' +
          ' @allure.label.tag:DWT-331',
        async () => {
          wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate =
            'invalid'

          const response =
            await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
              wasteReceiptData
            )

          expect(response.statusCode).toBe(400)
          expect(response.json).toEqual({
            validation: {
              errors: [
                {
                  key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.isEstimate',
                  errorType: 'UnexpectedError',
                  message:
                    '"wasteItems[0].disposalOrRecoveryCodes[0].weight.isEstimate" must be a boolean'
                }
              ]
            }
          })
        }
      )
    })
  })
})
