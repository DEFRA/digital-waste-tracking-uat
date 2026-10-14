import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Supporting references', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when more than one supporting reference is provided @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      receiptData.supportingReferences = beta2.supportingReferences()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when no supporting references are provided @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a supporting reference without a delivery ID when the label and reference are not both given @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      const supportingReference = beta2.supportingReference()
      delete supportingReference.label
      receiptData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a supporting reference without a delivery ID when the reference is longer than 50 characters @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.reference = 'A'.repeat(51)
      receiptData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when supporting references are an empty list @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      receiptData.supportingReferences = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a supporting reference without a delivery ID when the label is not recognised @allure.label.tag:DWTC-216', async () => {
      await addAllureLink('/DWTC-216', 'DWTC-216', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.label = 'Purchase order'
      receiptData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
