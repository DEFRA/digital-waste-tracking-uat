import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Physical Details', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when a valid physical form, containers and weight are declared @allure.label.tag:DWTC-237 @allure.label.tag:DWTC-273', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      await addAllureLink('/DWTC-273', 'DWTC-273', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when the waste is loose and no containers are used @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      receiptData.wasteItems[0].physicalDetails.containerType = 'LOO'
      receiptData.wasteItems[0].physicalDetails.containerCount = 0

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a receipt without a delivery ID when a loose container type is declared with more than 0 containers @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      receiptData.wasteItems[0].physicalDetails.containerType = 'LOO'
      receiptData.wasteItems[0].physicalDetails.containerCount = 1

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    // Required fields removed for required-field error assertions
    it('should reject a receipt without a delivery ID when physical details are missing all required fields @allure.label.tag:DWTC-237', async () => {
      await addAllureLink('/DWTC-237', 'DWTC-237', 'jira')
      const physicalDetails = beta2.physicalDetails()
      delete physicalDetails.form
      delete physicalDetails.containerType
      delete physicalDetails.containerCount
      delete physicalDetails.totalWeight
      receiptData.wasteItems[0].physicalDetails = physicalDetails

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
