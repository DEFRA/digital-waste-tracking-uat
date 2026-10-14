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

describe('Beta-2 Receipt Creation - Broker or dealer', () => {
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
    it('should create a receipt when no broker or dealer details are submitted @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when broker or dealer involvement is declared as false @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      receiptData.brokerOrDealer = { isPresent: false }
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when more than one broker or dealer is declared @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      const broker = beta2.brokerOrDealer()
      broker.address = beta2.brokerOrDealerAddress()
      receiptData.brokerOrDealer = {
        isPresent: true,
        items: [broker, beta2.secondBrokerOrDealer()]
      }
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when a broker or dealer gives a reason instead of a registration number @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      const broker = beta2.brokerOrDealer()
      delete broker.registrationNumber
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      receiptData.brokerOrDealer = { isPresent: true, items: [broker] }
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
    it('should reject a receipt when a broker or dealer is declared as involved but no details are given @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      receiptData.brokerOrDealer = { isPresent: true }
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receipt when broker or dealer details are given but involvement is false @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      receiptData.brokerOrDealer = {
        isPresent: false,
        items: [beta2.brokerOrDealer()]
      }
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
