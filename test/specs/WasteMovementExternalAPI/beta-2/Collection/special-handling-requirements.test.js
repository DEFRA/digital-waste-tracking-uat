import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2/collection.js'

describe('Beta-2 Collection Creation - Special handling requirements', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta2.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a collection when special handling requirements are given @allure.label.tag:DWTC-212', async () => {
      await addAllureLink('/DWTC-212', 'DWTC-212', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      collectionData.specialHandlingRequirements =
        beta2.specialHandlingRequirements

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a collection when special handling requirements are longer than 500 characters @allure.label.tag:DWTC-212', async () => {
      await addAllureLink('/DWTC-212', 'DWTC-212', 'jira')
      collectionData.specialHandlingRequirements = 'A'.repeat(501)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })
  })
})
