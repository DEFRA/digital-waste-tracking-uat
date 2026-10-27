import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Hazardous properties', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when the waste is declared as not having hazardous properties @allure.label.tag:DWTC-243', async () => {
      await addAllureLink('/DWTC-243', 'DWTC-243', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when the waste is declared with recognised hazardous properties and a component @allure.label.tag:DWTC-243 @allure.label.tag:DWTC-266', async () => {
      await addAllureLink('/DWTC-243', 'DWTC-243', 'jira')
      await addAllureLink('/DWTC-266', 'DWTC-266', 'jira')
      receiptData.wasteItems[0].classification = beta2.hazardousClassification()
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when more than one hazardous component is declared @allure.label.tag:DWTC-266', async () => {
      await addAllureLink('/DWTC-266', 'DWTC-266', 'jira')
      receiptData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousPresent(),
        components: [
          beta2.hazardousComponentWithAmount(),
          beta2.hazardousComponentWithThreshold()
        ]
      }
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when hazardous components are declared as not applicable @allure.label.tag:DWTC-266', async () => {
      await addAllureLink('/DWTC-266', 'DWTC-266', 'jira')
      receiptData.wasteItems[0].classification.hazardous =
        beta2.hazardousComponentsNotApplicable()
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a receipt without a delivery ID when hazardous properties are missing all required fields @allure.label.tag:DWTC-243 @allure.label.tag:DWTC-266', async () => {
      await addAllureLink('/DWTC-243', 'DWTC-243', 'jira')
      await addAllureLink('/DWTC-266', 'DWTC-266', 'jira')
      const hazardous = beta2.hazardousPresent()
      delete hazardous.codes
      delete hazardous.componentsSource
      delete hazardous.componentsNotApplicable
      delete hazardous.components
      receiptData.wasteItems[0].classification.hazardous = hazardous
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when hazardous details are given for waste declared as not hazardous @allure.label.tag:DWTC-243 @allure.label.tag:DWTC-266', async () => {
      await addAllureLink('/DWTC-243', 'DWTC-243', 'jira')
      await addAllureLink('/DWTC-266', 'DWTC-266', 'jira')
      const present = beta2.hazardousPresent()
      receiptData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousNotPresent(),
        codes: present.codes,
        componentsSource: present.componentsSource,
        componentsNotApplicable: present.componentsNotApplicable,
        components: present.components
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })

    it('should reject a receipt without a delivery ID when hazardous components are given although declared not applicable @allure.label.tag:DWTC-266', async () => {
      await addAllureLink('/DWTC-266', 'DWTC-266', 'jira')
      receiptData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousComponentsNotApplicable(),
        components: [beta2.hazardousComponentWithAmount()]
      }
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response)
    })
  })
})
