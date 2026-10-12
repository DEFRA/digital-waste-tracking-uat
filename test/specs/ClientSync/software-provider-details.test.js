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
      'should save softwareProvider details from the authenticated Cognito client' +
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
      'should retain softwareProvider details after updating a movement' +
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

    it(
      'should save new softwareProvider details after updating a movement with a different Cognito client' +
        ' @allure.label.tag:DWTA-380',
      async () => {
        const wasteTrackingId =
          await createMovementAndGetWasteTrackingId(wasteReceiptData)

        await authenticateAndSetToken(
          globalThis.testConfig.cognitoClientId2,
          globalThis.testConfig.cognitoClientSecret2
        )

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
            wasteTrackingId,
            true
          )

        expect(retrieveStatus).toBe(200)
        expect(movements).toHaveLength(2)

        const latestRevision = movements[0]
        expect(latestRevision.revision).toBe(2)
        expect(latestRevision.clientId).toBe(
          globalThis.testConfig.cognitoClientId2
        )
        expect(latestRevision.receipt.movement.softwareProvider).toEqual({
          id: globalThis.testConfig.cognitoClientId2,
          name: globalThis.testConfig.cognitoClientName2
        })

        const originalRevision = movements[1]
        expect(originalRevision.revision).toBe(1)
        expect(originalRevision.clientId).toBe(
          globalThis.testConfig.cognitoClientId
        )
        expect(originalRevision.receipt.movement.softwareProvider).toEqual({
          id: globalThis.testConfig.cognitoClientId,
          name: globalThis.testConfig.cognitoClientName
        })
      }
    )

    it(
      'should save new softwareProvider details after updating a movement with a different Cognito client and different API code' +
        ' @allure.label.tag:DWTA-380',
      async () => {
        // Create movement with Cognito client 1 and API code 1
        const wasteTrackingId =
          await createMovementAndGetWasteTrackingId(wasteReceiptData)

        // Create another api code with the same organisation
        const { statusCode: createApiCodeStatus, json: newApiCode } =
          await globalThis.apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
            globalThis.testConfig.organisationId
          )

        expect(createApiCodeStatus).toBe(200)
        expect(newApiCode).toHaveProperty('code', expect.any(String))

        await authenticateAndSetToken(
          globalThis.testConfig.cognitoClientId2,
          globalThis.testConfig.cognitoClientSecret2
        )

        const updatedData = generateBaseWasteReceiptData()
        updatedData.apiCode = newApiCode.code
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

        // Update the movement with cognito client 2 and the new api code
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
        expect(movement.clientId).toBe(globalThis.testConfig.cognitoClientId2)
        expect(movement.receipt.movement.softwareProvider).toEqual({
          id: globalThis.testConfig.cognitoClientId2,
          name: globalThis.testConfig.cognitoClientName2
        })
      }
    )
  })
})
