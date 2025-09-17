import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Receiver details validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-547', 'DWT-547', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should not allow waste movement to be created when receiver details are missing' +
      ' @allure.label.tag:DWT-547',
    async () => {
      delete wasteReceiptData.receiver

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receiver',
              errorType: 'NotProvided',
              message: '"Receiver" is required'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created when an invalid email is supplied for the receiver organisation' +
      ' @allure.label.tag:DWT-547',
    async () => {
      wasteReceiptData.receiver.emailAddress = 'invalidtest@'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receiver.emailAddress',
              errorType: 'UnexpectedError',
              message: '"receiver.emailAddress" must be a valid email'
            }
          ]
        }
      })
    }
  )
})
