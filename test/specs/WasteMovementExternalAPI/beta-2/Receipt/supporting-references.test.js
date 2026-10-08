import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import { expectCollectionCreated } from '~/test/support/helpers/beta-2/collection.js'
import { expectDeliveryCreated } from '~/test/support/helpers/beta-2/delivery.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Creation - Supporting references', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt when more than one supporting reference is provided @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')

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

      const deliveryResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          beta2.generateBaseDeliveryData([movementId])
        )
      expectDeliveryCreated(deliveryResponse, [movementId])
      const deliveryId = deliveryResponse.json.data.deliveries[0].deliveryId

      receiptData.supportingReferences = beta2.supportingReferences()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when no supporting references are provided @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')

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

      const deliveryResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          beta2.generateBaseDeliveryData([movementId])
        )
      expectDeliveryCreated(deliveryResponse, [movementId])
      const deliveryId = deliveryResponse.json.data.deliveries[0].deliveryId

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a supporting reference when the label and reference are not both given @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      const supportingReference = beta2.supportingReference()
      delete supportingReference.label
      receiptData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          beta2.unknownResourceId,
          receiptData
        )

      expectReceiptRejected(response, beta2.unknownResourceId)
    })

    it('should reject a supporting reference when the reference is longer than 50 characters @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.reference = 'A'.repeat(51)
      receiptData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          beta2.unknownResourceId,
          receiptData
        )

      expectReceiptRejected(response, beta2.unknownResourceId)
    })

    it('should reject a receipt when supporting references are an empty list @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      receiptData.supportingReferences = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          beta2.unknownResourceId,
          receiptData
        )

      expectReceiptRejected(response, beta2.unknownResourceId)
    })

    it('should reject a supporting reference when the label is not recognised @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.label = 'Purchase order'
      receiptData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          beta2.unknownResourceId,
          receiptData
        )

      expectReceiptRejected(response, beta2.unknownResourceId)
    })
  })
})
