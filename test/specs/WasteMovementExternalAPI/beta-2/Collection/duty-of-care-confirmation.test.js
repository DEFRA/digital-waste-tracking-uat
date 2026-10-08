import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2/collection.js'

describe('Beta-2 Collection Creation - Duty of care confirmation', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta2.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a collection when duty of care is confirmed as true @allure.label.tag:DWTC-232', async () => {
      await addAllureLink('/DWTC-232', 'DWTC-232', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })

    it('should create a collection when duty of care is confirmed as false @allure.label.tag:DWTC-232', async () => {
      await addAllureLink('/DWTC-232', 'DWTC-232', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      collectionData.dutyOfCareConfirmed = false

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a collection when duty of care confirmation is missing @allure.label.tag:DWTC-232', async () => {
      await addAllureLink('/DWTC-232', 'DWTC-232', 'jira')
      delete collectionData.dutyOfCareConfirmed

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })
  })
})
