import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2/collection.js'

describe('Beta-2 Collection Creation - Collection site', () => {
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
    it('should create a collection when a valid actual collection date and time, address and contact details are given @allure.label.tag:DWTC-239', async () => {
      await addAllureLink('/DWTC-239', 'DWTC-239', 'jira')

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
    // Required fields removed for required-field error assertions
    it('should reject a collection when collection details are missing all required fields @allure.label.tag:DWTC-239', async () => {
      await addAllureLink('/DWTC-239', 'DWTC-239', 'jira')
      delete collectionData.actualCollectionDateTime
      const collectionSite = beta2.collectionSite()
      delete collectionSite.address
      delete collectionSite.contactDetails
      collectionData.collectionSite = collectionSite

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
