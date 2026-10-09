import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import { expectCollectionCreated } from '~/test/support/helpers/beta-2/collection.js'
import {
  expectDeliveryCreated,
  expectDeliveryRejected
} from '~/test/support/helpers/beta-2/delivery.js'

describe('Beta-2 Delivery Creation - Supporting references', () => {
  let deliveryData

  beforeEach(async () => {
    deliveryData = beta2.generateBaseDeliveryData([beta2.unknownResourceId])
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a delivery when more than one supporting reference is provided @allure.label.tag:DWTC-215', async () => {
      await addAllureLink('/DWTC-215', 'DWTC-215', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const collectionResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          beta2.generateBaseCollectionData()
        )
      expectCollectionCreated(collectionResponse)

      deliveryData = beta2.generateBaseDeliveryData([movementId])
      deliveryData.supportingReferences = beta2.supportingReferences()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })

    it('should create a delivery when no supporting references are provided @allure.label.tag:DWTC-215', async () => {
      await addAllureLink('/DWTC-215', 'DWTC-215', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const collectionResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          beta2.generateBaseCollectionData()
        )
      expectCollectionCreated(collectionResponse)

      deliveryData = beta2.generateBaseDeliveryData([movementId])

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })
  })

  describe('Problem Responses', () => {
    it('should reject a supporting reference when the label and reference are not both given @allure.label.tag:DWTC-215', async () => {
      await addAllureLink('/DWTC-215', 'DWTC-215', 'jira')
      const supportingReference = beta2.supportingReference()
      delete supportingReference.label
      deliveryData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a supporting reference when the reference is longer than 50 characters @allure.label.tag:DWTC-215', async () => {
      await addAllureLink('/DWTC-215', 'DWTC-215', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.reference = 'A'.repeat(51)
      deliveryData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a delivery when supporting references are an empty list @allure.label.tag:DWTC-215', async () => {
      await addAllureLink('/DWTC-215', 'DWTC-215', 'jira')
      deliveryData.supportingReferences = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a supporting reference when the label is not recognised @allure.label.tag:DWTC-215', async () => {
      await addAllureLink('/DWTC-215', 'DWTC-215', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.label = 'Purchase order'
      deliveryData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })
  })
})
