import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { createMovementAndGetWasteTrackingId } from '~/test/support/helpers/waste-movement.js'

describe('Software provider data persisted in waste movement', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWTA-380', 'DWTA-380', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Persisted software provider details', () => {
    it(
      'should save softwareProvider id and name from the authenticated Cognito client' +
        ' @allure.label.tag:DWTA-380',
      async () => {
        const wasteTrackingId =
          await createMovementAndGetWasteTrackingId(wasteReceiptData)

        const { statusCode: retrieveStatus, json: movements } =
          await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByWasteTrackingId(
            wasteTrackingId
          )

        expect(retrieveStatus).toBe(200)
        expect(movements).toHaveLength(1)

        const movement = movements[0]
        expect(movement.clientId).toBe(globalThis.testConfig.cognitoClientId)
        expect(movement.receipt.movement.softwareProvider).toEqual({
          id: globalThis.testConfig.cognitoClientId,
          name: globalThis.testConfig.cognitoClientName
        })
      }
    )

    it(
      'should retain softwareProvider id and name after updating a movement' +
        ' @allure.label.tag:DWTA-380',
      async () => {
        const wasteTrackingId =
          await createMovementAndGetWasteTrackingId(wasteReceiptData)

        const updatedData = generateBaseWasteReceiptData()
        updatedData.wasteItems[0].disposalOrRecoveryCodes = [
          {
            code: 'D1',
            weight: {
              metric: 'Tonnes',
              amount: 3.0,
              isEstimate: false
            }
          }
        ]

        const { statusCode: updateStatus } =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
            wasteTrackingId,
            updatedData
          )

        expect(updateStatus).toBe(200)

        const { statusCode: retrieveStatus, json: movements } =
          await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByWasteTrackingId(
            wasteTrackingId
          )

        expect(retrieveStatus).toBe(200)
        expect(movements).toHaveLength(1)

        const movement = movements[0]
        expect(movement.revision).toBe(2)
        expect(movement.clientId).toBe(globalThis.testConfig.cognitoClientId)
        expect(movement.receipt.movement.softwareProvider).toEqual({
          id: globalThis.testConfig.cognitoClientId,
          name: globalThis.testConfig.cognitoClientName
        })
      }
    )
  })
})
