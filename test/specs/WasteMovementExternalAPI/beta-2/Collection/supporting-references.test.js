import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2/collection.js'

describe('Beta-2 Collection Creation - Supporting references', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta2.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  async function createMovement() {
    const createResponse =
      await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
        beta2.generateBaseMovementData()
      )
    expectMovementCreated(createResponse)
    return createResponse.json.data.movementId
  }

  describe('Successful Creation', () => {
    it('should create a collection when more than one supporting reference is provided @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')

      const movementId = await createMovement()

      collectionData.supportingReferences = beta2.supportingReferences()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })

    it('should create a collection when no supporting references are provided @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')

      const movementId = await createMovement()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a collection when supporting references are an empty list @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')
      collectionData.supportingReferences = []

      const movementId = await createMovement()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionRejected(response, movementId)
    })
  })
})
