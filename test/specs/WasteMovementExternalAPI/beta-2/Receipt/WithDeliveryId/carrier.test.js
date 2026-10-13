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

describe('Beta-2 Receipt Creation - Carrier', () => {
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
    it('should create a receipt when a carrier with valid details is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when a carrier gives a reason instead of a registration number @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier.registrationNumber
      receiptData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when a carrier transports by other means with a description @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      receiptData.carrier.meansOfTransport = 'Other'
      delete receiptData.carrier.vehicleRegistration
      receiptData.carrier.otherMeansOfTransport = beta2.otherMeansOfTransport
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
    it('should reject a receipt when more than one carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      receiptData.carrier = [beta2.carrier(), beta2.secondIntendedCarrier()]
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receipt when no carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier when the organisation name is missing @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier.organisationName
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier when the means of transport is missing @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier.meansOfTransport
      delete receiptData.carrier.vehicleRegistration
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier when neither a registration number nor a reason is given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier.registrationNumber
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier when both a registration number and a reason are given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      receiptData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier transporting by road without a vehicle registration @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier.vehicleRegistration
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier transporting by other means without a description @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      receiptData.carrier.meansOfTransport = 'Other'
      delete receiptData.carrier.vehicleRegistration
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a carrier when neither an email address nor a phone number is given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      receiptData.carrier.contactDetails = {}
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
