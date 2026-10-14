import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Receiver', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when a receiver with valid details is declared @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when a receiver is declared with only a phone number @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      receiptData.receiver.contactDetails =
        beta2.secondIntendedReceiver().contactDetails

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a receipt without a delivery ID when more than one receiver is declared @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      receiptData.receiver = [
        beta2.intendedReceiver(),
        beta2.secondIntendedReceiver()
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when no receiver is declared @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receiver when the site name is missing @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver.siteName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receiver when the authorisation number is missing @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver.authorisationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receiver when the receipt address is missing @allure.label.tag:DWTC-233', async () => {
      await addAllureLink('/DWTC-233', 'DWTC-233', 'jira')
      delete receiptData.receiver.receiptAddress

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
