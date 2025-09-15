import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateCompleteWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Number of containers for a waste item Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-337', 'DWT-337', 'jira')
    wasteReceiptData = generateCompleteWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Number of waste containers must be a positive integer or a 0', () => {
    it(
      'should accept a waste with number of containers greater than 0 ' +
        ' @allure.label.tag:DWT-337',
      async () => {
        wasteReceiptData.wasteItems[0].numberOfContainers = 5
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
        // ToDo:Assert that the record has been created successfully in the DB
      }
    )
    it(
      'should accept a waste when number of containers supplied value is0 ' +
        ' @allure.label.tag:DWT-337',
      async () => {
        wasteReceiptData.wasteItems[0].numberOfContainers = 0
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(200)
        expect(response.json).toHaveProperty('globalMovementId')
        // ToDo:Assert that the record has been created successfully in the DB
      }
    )
  })

  it(
    'should not allow waste movement to be created when number of containers is not provided for a waste item' +
      ' @allure.label.tag:DWT-337',
    async () => {
      delete wasteReceiptData.wasteItems[0].numberOfContainers

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.numberOfContainers',
              errorType: 'NotProvided',
              message: '"wasteItems[0].numberOfContainers" is required'
            }
          ]
        }
      })
    }
  )
})
