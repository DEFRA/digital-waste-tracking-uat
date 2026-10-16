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

describe('Beta-2 Receipt Creation - Physical Details', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  async function createDeliveryForReceipt() {
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
    return deliveryResponse.json.data.deliveries[0].deliveryId
  }

  describe('Successful Creation', () => {
    it('should create a receipt when a valid physical form, containers and weight are declared @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when the waste is loose and no containers are used @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      receiptData.physicalDetails.containerType = 'LOO'
      receiptData.physicalDetails.containerCount = 0
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a receipt when a loose container type is declared with more than 0 containers @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      receiptData.physicalDetails.containerType = 'LOO'
      receiptData.physicalDetails.containerCount = 1
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    // Required fields removed for required-field error assertions
    it('should reject a receipt when physical details are missing all required fields @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      const physicalDetails = beta2.physicalDetails()
      delete physicalDetails.form
      delete physicalDetails.containerType
      delete physicalDetails.containerCount
      delete physicalDetails.totalWeight
      receiptData.physicalDetails = physicalDetails
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })
  })
})
