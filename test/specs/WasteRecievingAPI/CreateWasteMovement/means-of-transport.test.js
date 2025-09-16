import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Carrier Means of transport Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-319', 'DWT-319', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Validate the waste carrier is using an allowed means of transportation', () => {
    it(
      'should accept a means of transport with value "Other" ' +
        ' @allure.label.tag:DWT-319' +
        ' @allure.label.tag:DWT-347',
      async () => {
        wasteReceiptData.carrier.meansOfTransport = "Other"
        delete wasteReceiptData.carrier.vehicleRegistration
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
    'should accept vehicle registration number only when means of transport is "Road"' +
      ' @allure.label.tag:DWT-347',
    async () => {
      wasteReceiptData.carrier.meansOfTransport = 'Road'
      wasteReceiptData.carrier.vehicleRegistration = 'GM15 QVF'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    }
  )

  it(
    'should return an error when means of transport is "Road" and no vehicle registration number is provided' +
      ' @allure.label.tag:DWT-347',
    async () => {
      wasteReceiptData.carrier.meansOfTransport = 'Road'
      delete wasteReceiptData.carrier.vehicleRegistration
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.vehicleRegistration',
              errorType: 'NotProvided',
              message:
                'If carrier.meansOfTransport is "Road" then carrier.vehicleRegistration is required.'
            }
          ]
        }
      })
    }
  )

  // 'Piped'],['Inland Waterway'],['Air'],['Sea'],['Other']
  describe('Validate vehicle registration number is not required when means of transport is not Road', () => {
    it(
      'should return an error when vehicle registration number is provided when means of transport is "Rail" i.e. not Road' +
        ' @allure.label.tag:DWT-347',
      async () => {
        wasteReceiptData.carrier.meansOfTransport = "Rail"
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'carrier.vehicleRegistration',
                errorType: 'UnexpectedError',
                message:
                  'If carrier.meansOfTransport is not "Road" then carrier.vehicleRegistration is not applicable.'
              }
            ]
          }
        })
      }
    )
  })

  it.skip(
    'should not allow waste movement to be created when there is no means of transport provided' +
      ' @allure.label.tag:DWT-319' +
      ' @allure.label.tag:bug:DWT-567',
    async () => {
      delete wasteReceiptData.carrier.meansOfTransport
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      // ToDo: should there be a specific error populated in the response ??
      // expect(response.json).toHaveProperty('globalMovementId')
    }
  )

  it(
    'should not allow waste movement to be created when there is an invalid means of transport value provided' +
      ' @allure.label.tag:DWT-319',
    async () => {
      // await addAllureLink('/DWT-571', 'DWT-571', 'issue')
      wasteReceiptData.carrier.meansOfTransport = 'incorrect'
      delete wasteReceiptData.carrier.vehicleRegistration
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'carrier.meansOfTransport',
              errorType: 'UnexpectedError',
              message:
                '"carrier.meansOfTransport" must be one of [Road, Rail, Air, Sea, Inland Waterway, Piped, Other]'
            }
          ]
        }
      })
    }
  )
})
