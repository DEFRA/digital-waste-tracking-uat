import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Carrier', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when a carrier with valid details is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when a carrier gives a reason instead of a registration number @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier.registrationNumber
      receiptData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a receipt without a delivery ID when more than one carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      receiptData.carrier = [beta2.carrier(), beta2.secondIntendedCarrier()]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when no carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete receiptData.carrier

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
