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
    it('should accept a waste receipt when hazardous indicator is set to true, source of components is NOT_PROVIDED and no components are provided', async () => {
      wasteReceiptData.wasteItems[0].containsHazardous = true
      wasteReceiptData.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED',
        hazCodes: ['HP_6']
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it(
      'should accept waste receipt when hazardous indicator is set to false and no components are provided' +
        ' @allure.label.tag:DWT-351',
      async () => {
        await addAllureLink('/DWT-351', 'DWT-351', 'jira')
        wasteReceiptData.wasteItems[0].containsHazardous = false
        wasteReceiptData.wasteItems[0].hazardous = {
          sourceOfComponents: 'NOT_PROVIDED'
        }

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
      'should accept waste receipt when hazardous indicator is set to true and components are provided' +
        ' @allure.label.tag:DWT-351',
      async () => {
        await addAllureLink('/DWT-351', 'DWT-351', 'jira')
        wasteReceiptData.wasteItems[0].containsHazardous = true
        wasteReceiptData.wasteItems[0].hazardous = {
          hazCodes: ['HP_6'],
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

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String)
        })
      }
    )
  })

  it(
    'should reject waste receipt submission when hazardous indicator is set to false, source of components is NOT_PROVIDED and components are provided' +
      ' @allure.label.tag:DWT-351' +
      ' @allure.label.tag:DWT-624',
    async () => {
      await addAllureLink('/DWT-351', 'DWT-351', 'jira')
      wasteReceiptData.wasteItems[0].containsHazardous = false
      wasteReceiptData.wasteItems[0].hazardous = {
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
              key: 'wasteItems.0.hazardous.components',
              errorType: 'UnexpectedError',
              message:
                '"wasteItems[0].hazardous.components" must not be provided when containsHazardous is false'
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
      delete wasteReceiptData.wasteItems[0].containsHazardous

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.containsHazardous',
              errorType: 'NotProvided',
              message: '"wasteItems[0].containsHazardous" is required'
            }
          ]
        }
      })
    })

    it('should reject waste receipt when hazardous indicator is invalid', async () => {
      wasteReceiptData.wasteItems[0].containsHazardous = 'invalid'
      wasteReceiptData.wasteItems[0].hazardous = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.containsHazardous',
              errorType: 'UnexpectedError',
              message: '"wasteItems[0].containsHazardous" must be a boolean'
            }
          ]
        }
      })
    })
  })
})
