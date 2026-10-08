import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2-movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2-collection.js'

describe('Beta-2 Collection Creation - Supporting references', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta2.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a collection when more than one supporting reference is provided @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      collectionData.supportingReferences = beta2.supportingReferences()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a supporting reference when the label and reference are not both given @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')
      const supportingReference = beta2.supportingReference()
      delete supportingReference.label
      collectionData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a supporting reference when the reference is longer than 50 characters @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.reference = 'A'.repeat(51)
      collectionData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a collection when supporting references are an empty list @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')
      collectionData.supportingReferences = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a supporting reference when the label is not recognised @allure.label.tag:DWTC-214', async () => {
      await addAllureLink('/DWTC-214', 'DWTC-214', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.label = 'Purchase order'
      collectionData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })
  })
})
