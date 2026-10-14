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

describe('Beta-2 Receipt Creation - Receiver', () => {
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
    it('should create a receipt when a receiver with valid details is declared @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when a receiver is declared with only a phone number @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      receiptData.receiver.contactDetails =
        beta2.secondIntendedReceiver().contactDetails
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
    it('should reject a receipt when more than one receiver is declared @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      receiptData.receiver = [
        beta2.intendedReceiver(),
        beta2.secondIntendedReceiver()
      ]
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receipt when no receiver is declared @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receiver when the site name is missing @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver.siteName
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receiver when the authorisation number is missing @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver.authorisationNumber
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receiver when the receipt address is missing @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver.receiptAddress
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
