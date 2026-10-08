import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Creation Without Delivery ID - Broker or dealer', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt when no broker or dealer details are submitted @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt when more than one broker or dealer is declared @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')

      const broker = beta2.brokerOrDealer()
      broker.address = beta2.brokerOrDealerAddress()
      receiptData.brokerOrDealer = {
        isPresent: true,
        items: [broker, beta2.secondBrokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt when a broker or dealer gives a reason instead of a registration number @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')

      const broker = beta2.brokerOrDealer()
      delete broker.registrationNumber
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      receiptData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a receipt when a broker or dealer is declared as involved but no details are given @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      receiptData.brokerOrDealer = { isPresent: true }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt when broker or dealer details are given but involvement is false @allure.label.tag:DWTC-159', async () => {
      await addAllureLink('/DWTC-159', 'DWTC-159', 'jira')
      receiptData.brokerOrDealer = {
        isPresent: false,
        items: [beta2.brokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
