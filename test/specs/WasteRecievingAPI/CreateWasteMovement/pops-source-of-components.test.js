import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('POPs Source Of Components Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-623', 'DWT-623', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Invalid POPs Source Of Components', () => {
    it(
      'should reject waste containing POPs with source of components as an empty string' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].containsPops = true
        wasteReceiptData.wasteItems[0].pops = {
          sourceOfComponents: '',
          components: [
            {
              name: 'PFOS',
              concentration: 2.5
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
                key: 'wasteItems.0.pops.sourceOfComponents',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.sourceOfComponents" must be one of [CARRIER_PROVIDED, GUIDANCE, OWN_TESTING, NOT_PROVIDED]'
              },
              {
                key: 'wasteItems.0.pops.sourceOfComponents',
                errorType: 'UnexpectedError',
                message:
                  '"wasteItems[0].pops.sourceOfComponents" is not allowed to be empty'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste containing POPs with source of components is not provided' +
        ' @allure.label.tag:DWT-624',
      async () => {
        wasteReceiptData.wasteItems[0].containsPops = true
        wasteReceiptData.wasteItems[0].pops = {
          components: [
            {
              name: 'PFOS',
              concentration: 2.5
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
                  '"wasteItems[0].pops.sourceOfComponents" is required when containsPops is true'
              }
            ]
          }
        })
      }
    )
  })
})
