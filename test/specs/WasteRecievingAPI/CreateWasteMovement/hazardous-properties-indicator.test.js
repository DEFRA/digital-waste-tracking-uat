import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Hazardous Properties Indicator Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Hazardous Indicator', () => {
    it.skip('should accept waste receipt when hazardous indicator is set to true and no components are provided', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: true,
        sourceOfComponents: 'CARRIER_PROVIDED'
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
    })

    it(
      'should accept waste receipt when hazardous indicator is set to false and no components are provided' +
        ' @allure.label.tag:DWT-351',
      async () => {
        await addAllureLink('/DWT-351', 'DWT-351', 'jira')
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: false,
          sourceOfComponents: 'NOT_PROVIDED'
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
      'should accept waste receipt when hazardous indicator is set to true and components are provided' +
        ' @allure.label.tag:DWT-351',
      async () => {
        await addAllureLink('/DWT-351', 'DWT-351', 'jira')
        wasteReceiptData.wasteItems[0].hazardous = {
          containsHazardous: true,
          sourceOfComponents: 'CARRIER_PROVIDED',
          components: [
            {
              name: 'Mercury',
              concentration: 0.25
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

  it.skip(
    'should reject waste receipt submission when hazardous indicator is set to false and components are provided' +
      ' @allure.label.tag:DWT-351',
    async () => {
      await addAllureLink('/DWT-351', 'DWT-351', 'jira')
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: false,
        sourceOfComponents: 'NOT_PROVIDED',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
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
                'Chemical or Biological components cannot be provided when no hazardous properties are indicated'
            }
          ]
        }
      })
    }
  )

  describe('Invalid Hazardous Indicator', () => {
    it('should reject waste receipt when hazardous indicator is missing', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        sourceOfComponents: 'CARRIER_PROVIDED',
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      }
      // Note: containsHazardous field is intentionally omitted to test required validation

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.hazardous.containsHazardous',
              errorType: 'NotProvided',
              message:
                'Hazardous waste is any waste that is potentially harmful to human health or the environment.'
            }
          ]
        }
      })
    })

    it.skip('should reject waste receipt when hazardous indicator is invalid', async () => {
      wasteReceiptData.wasteItems[0].hazardous = {
        containsHazardous: 'invalid'
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
              key: 'wasteItems.0.hazardous.containsHazardous',
              errorType: 'UnexpectedError',
              message:
                '"wasteItems[0].hazardous.containsHazardous" must be a boolean'
            }
          ]
        }
      })
    })
  })
})
