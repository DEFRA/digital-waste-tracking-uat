import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Persistent organic pollutants', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when the waste is declared as not containing POPs @allure.label.tag:DWTC-242', async () => {
      await addAllureLink('/DWTC-242', 'DWTC-242', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when a POP is declared with an amount and source @allure.label.tag:DWTC-242', async () => {
      await addAllureLink('/DWTC-242', 'DWTC-242', 'jira')
      receiptData.wasteItems[0].classification.pops = beta2.popsPresent()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when more than one POP is declared @allure.label.tag:DWTC-242', async () => {
      await addAllureLink('/DWTC-242', 'DWTC-242', 'jira')
      receiptData.wasteItems[0].classification.pops = {
        ...beta2.popsPresent(),
        components: [
          beta2.popComponentWithAmount(),
          beta2.popComponentWithThreshold()
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a receipt without a delivery ID when POPs are missing all required fields @allure.label.tag:DWTC-242', async () => {
      await addAllureLink('/DWTC-242', 'DWTC-242', 'jira')
      const pops = beta2.popsPresent()
      delete pops.componentsSource
      delete pops.components
      receiptData.wasteItems[0].classification.pops = pops

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when POP details are given for waste declared as not containing POPs @allure.label.tag:DWTC-242', async () => {
      await addAllureLink('/DWTC-242', 'DWTC-242', 'jira')
      receiptData.wasteItems[0].classification.pops = {
        ...beta2.popsNotPresent(),
        componentsSource: beta2.popsPresent().componentsSource,
        components: beta2.popsPresent().components
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
