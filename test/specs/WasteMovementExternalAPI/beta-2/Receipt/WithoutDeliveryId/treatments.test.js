import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Treatments', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when a treatment with a valid disposal or recovery code and weight is declared @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when more than one treatment is declared @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      receiptData.wasteItems[0].treatments = [
        beta2.treatment(),
        beta2.secondTreatment()
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a receipt without a delivery ID when no treatment is declared @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      delete receiptData.wasteItems[0].treatments

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when treatments are an empty list @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      receiptData.wasteItems[0].treatments = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when any one of several treatments has missing details @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      const invalidTreatment = beta2.secondTreatment()
      delete invalidTreatment.weight
      receiptData.wasteItems[0].treatments = [
        beta2.treatment(),
        invalidTreatment
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    // Required fields removed for required-field error assertions
    it('should reject a receipt without a delivery ID when a treatment is missing all required fields @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      const treatment = beta2.treatment()
      delete treatment.disposalOrRecoveryCode
      treatment.weight = {}
      receiptData.wasteItems[0].treatments = [treatment]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
