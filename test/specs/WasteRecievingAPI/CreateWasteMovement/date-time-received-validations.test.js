import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Receiving date timestamp validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-334', 'DWT-334', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  //  Note: when there is no timezone provided , UTC is being assumed by default

  it(
    'should successfully create a new waste movement when date timestamp is supplied with a timezone offset' +
      ' allure.label.tag:DWT-334',
    async () => {
      await addAllureLink('/DWT-334', 'DWT-334', 'jira')
      //   generate a British Summer Time stamp [BST]
      wasteReceiptData.dateTimeReceived = '2025-06-01T04:34:30+01:00'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
      //   above timestamp will be converted to UTC and saved in db as 2025-06-01T03:34:30.000Z as expected
    }
  )

  it(
    'should not allow waste movement to be created when invalid date timestamp for the request is supplied' +
      ' @allure.label.tag:DWT-334',
    async () => {
      wasteReceiptData.dateTimeReceived = '2025-14-12T04:34:30'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'dateTimeReceived',
              errorType: 'InvalidFormat',
              message: '"dateTimeReceived" must be in ISO 8601 date format'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created when date timestamp for the request is not supplied' +
      ' @allure.label.tag:DWT-334',
    async () => {
      delete wasteReceiptData.dateTimeReceived

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'dateTimeReceived',
              errorType: 'NotProvided',
              message: '"dateTimeReceived" is required'
            }
          ]
        }
      })
    }
  )
})
