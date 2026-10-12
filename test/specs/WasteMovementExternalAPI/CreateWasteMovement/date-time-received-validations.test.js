import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '../../../support/helpers/waste-movement.js'

describe('Receiving date timestamp validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-334', 'DWT-334', 'jira')
    await addAllureLink('/DWTA-386', 'DWTA-386', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should successfully create a new waste movement when date timestamp is supplied in UTC' +
      ' @allure.label.tag:DWT-334 @allure.label.tag:DWTA-386',
    async () => {
      const dateTimeReceivedUtc = new Date().toISOString()
      wasteReceiptData.dateTimeReceived = dateTimeReceivedUtc

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const { statusCode: retrieveStatus, json: movements } =
        await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByWasteTrackingId(
          wasteTrackingId
        )

      expect(retrieveStatus).toBe(200)
      expect(movements).toHaveLength(1)
      expect(movements[0].receipt.movement.dateTimeReceived).toBe(
        dateTimeReceivedUtc
      )
    }
  )

  it(
    'should successfully create a new waste movement when date timestamp is supplied in BST format' +
      ' @allure.label.tag:DWT-334 @allure.label.tag:DWTA-386 @allure.label.tag:DWTA-446',
    async () => {
      //   generate a British Summer Time stamp [BST]
      const dateTimeReceivedBst = '2025-06-01T04:34:30+01:00'
      wasteReceiptData.dateTimeReceived = dateTimeReceivedBst

      const wasteTrackingId =
        await createMovementAndGetWasteTrackingId(wasteReceiptData)

      const { statusCode: retrieveStatus, json: movements } =
        await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByWasteTrackingId(
          wasteTrackingId
        )

      expect(retrieveStatus).toBe(200)
      expect(movements).toHaveLength(1)

      const expectedUtc = new Date(dateTimeReceivedBst).toISOString()
      expect(movements[0].receipt.movement.dateTimeReceived).toBe(expectedUtc)
    }
  )

  it(
    'should not allow waste movement to be created when date timestamp timezone is not UTC or BST' +
      ' @allure.label.tag:DWT-334 @allure.label.tag:DWTA-386',
    async () => {
      wasteReceiptData.dateTimeReceived = '2025-06-01T04:34:30+02:00'

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
              errorType: 'InvalidValue',
              message:
                '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created when timestamp is not in ISO 8601 format' +
      ' @allure.label.tag:DWT-334 @allure.label.tag:DWTA-386',
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
              message:
                '"dateTimeReceived" must be a valid UTC (2025-09-15T12:12:28Z) or BST (2025-09-15T13:12:28+01:00) ISO datetime'
            }
          ]
        }
      })
    }
  )

  it(
    'should not allow waste movement to be created when date timestamp for the request is not supplied' +
      ' @allure.label.tag:DWT-334 @allure.label.tag:DWTA-386',
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
