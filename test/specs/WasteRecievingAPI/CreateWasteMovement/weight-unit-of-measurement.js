import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

// weight object appears in 'wasteItems' array and also in 'disposalOrRecoveryCodes' array
describe('Waste Weight unit of measurement Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-336', 'DWT-336', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('unit of measurement validations for weight object in "wasteItems" array', () => {
    it(
      'should reject create movement submission when weight unit of measurement is missing' +
        ' @allure.label.tag:DWT-336',
      async () => {
        delete wasteReceiptData.wasteItems[0].weight.metric

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.weight.metric',
                errorType: 'NotProvided',
                message: '"wasteItems[0].weight.metric" is required'
              }
            ]
          }
        })
      }
    )

    it('should reject create movement submission when weight unit of measurement is invalid', async () => {
      wasteReceiptData.wasteItems[0].weight.metric = 'Litres'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.weight.metric',
              errorType: 'UnexpectedError',
              message:
                '"wasteItems[0].weight.metric" must be one of [Grams, Kilograms, Tonnes]'
            }
          ]
        }
      })
    })

    it('should reject create movement submission when weight unit of measurement is blank', async () => {
      wasteReceiptData.wasteItems[0].weight.metric = ''

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      // made the match generic so that the test doesn't break when the errors are returned in a different order
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.weight.metric',
              errorType: 'UnexpectedError',
              message: expect.stringMatching(
                /^"wasteItems\[0\]\.weight\.metric" (is not allowed to be empty|must be one of \[Grams, Kilograms, Tonnes\])$/
              )
            },
            {
              key: 'wasteItems.0.weight.metric',
              errorType: 'UnexpectedError',
              message: expect.stringMatching(
                /^"wasteItems\[0\]\.weight\.metric" (is not allowed to be empty|must be one of \[Grams, Kilograms, Tonnes\])$/
              )
            }
          ]
        }
      })
    })
  })

  // ToDo: Pending unitl the current issue w.r.t disposalOrRecoveryCodes locations is resolved
  describe.skip('unit of measurement validations for weight object in "disposalOrRecoveryCodes" array', () => {
    it(
      'should reject create movement submission when weight unit of measurement is missing' +
        ' @allure.label.tag:DWT-336',
      async () => {
        delete wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes[0].weight
          .metric

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.metric',
                errorType: 'NotProvided',
                message:
                  '"wasteItems[0].disposalOrRecoveryCodes[0].weight.metric" is required'
              }
            ]
          }
        })
      }
    )

    it('should reject create movement submission when weight unit of measurement is invalid', async () => {
      wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes[0].weight.metric =
        'Litres'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.metric',
              errorType: 'UnexpectedError',
              message:
                '"wasteItems[0].disposalOrRecoveryCodes[0].weight.metric" must be one of [Grams, Kilograms, Tonnes]'
            }
          ]
        }
      })
    })

    it('should reject create movement submission when weight unit of measurement is blank', async () => {
      wasteReceiptData.wasteItems[0].disposalOrRecoveryCodes[0].weight.metric =
        ''

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      // made the match generic so that the test doesn't break when the errors are returned in a different order
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.metric',
              errorType: 'UnexpectedError',
              message: expect.stringMatching(
                /^"wasteItems\[0\]\.disposalOrRecoveryCodes\[0\]\.weight\.metric" (is not allowed to be empty|must be one of \[Grams, Kilograms, Tonnes\])$/
              )
            },
            {
              key: 'wasteItems.0.disposalOrRecoveryCodes.0.weight.metric',
              errorType: 'UnexpectedError',
              message: expect.stringMatching(
                /^"wasteItems\[0\]\.disposalOrRecoveryCodes\[0\]\.weight\.metric" (is not allowed to be empty|must be one of \[Grams, Kilograms, Tonnes\])$/
              )
            }
          ]
        }
      })
    })
  })
})
