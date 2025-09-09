import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateCompleteWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Waste physical form field validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-340', 'DWT-340', 'jira')
    wasteReceiptData = generateCompleteWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should accept a valid physical form value from the allowed list ["Gas", "Liquid", "Solid", "Powder", "Sludge" or "Mixed"]' +
      ' @allure.label.tag:DWT-340',
    async () => {
      // Function to generate random physical form
      const getRandomPhysicalForm = () => {
        const physicalForms = [
          'Gas',
          'Liquid',
          'Solid',
          'Powder',
          'Sludge',
          'Mixed'
        ]
        return physicalForms[Math.floor(Math.random() * physicalForms.length)]
      }

      wasteReceiptData.wasteItems[0].physicalForm = getRandomPhysicalForm()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    }
  )

  it(
    'should not allow waste movement to be created, when any waste items physical form data is missing' +
      ' @allure.label.tag:DWT-340',
    async () => {
      delete wasteReceiptData.wasteItems[0].physicalForm

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.physicalForm',
              errorType: 'NotProvided',
              message: '"wasteItems[0].physicalForm" is required'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created, when a not allowed value is supplied for waste items physical form' +
      ' @allure.label.tag:DWT-340',
    async () => {
      wasteReceiptData.wasteItems[0].physicalForm = 'Invalid'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.physicalForm',
              errorType: 'UnexpectedError',
              message:
                '"wasteItems[0].physicalForm" must be one of [Gas, Liquid, Solid, Powder, Sludge, Mixed]'
            }
          ]
        }
      })
    }
  )
})
