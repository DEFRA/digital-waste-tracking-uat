import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

describe('Beta-2 Receipt Without Delivery ID - Classification', () => {
  let receiptData

  beforeEach(async () => {
    receiptData = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a receipt without a delivery ID when non-hazardous waste is described without a consignment code @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when a consignment code is given for non-hazardous waste @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when a mirror EWC code is provided @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification.ewcCodes = beta2.mirrorEwcCodes()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when hazardous waste has a consignment code @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification = beta2.hazardousClassification()
      receiptData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })

    it('should create a receipt without a delivery ID when hazardous waste has a reason for no consignment code @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification = beta2.hazardousClassification()
      receiptData.consignmentNote = beta2.consignmentNoteWithReason()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a receipt without a delivery ID when classification is missing all required fields @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      const classification = beta2.classification()
      delete classification.wasteDescription
      delete classification.ewcCodes
      delete classification.pops
      delete classification.hazardous
      receiptData.wasteItems[0].classification = classification

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response, [
        {
          message: "'wasteDescription' is required",
          pointer: '/wasteItems/0/classification/wasteDescription',
          errorType: 'NotProvided'
        },
        {
          message: "'ewcCodes' is required",
          pointer: '/wasteItems/0/classification/ewcCodes',
          errorType: 'NotProvided'
        },
        {
          message: "'pops' is required",
          pointer: '/wasteItems/0/classification/pops',
          errorType: 'NotProvided'
        },
        {
          message: "'hazardous' is required",
          pointer: '/wasteItems/0/classification/hazardous',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a receipt without a delivery ID when an EWC code is not recognised @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification.ewcCodes = ['999999']

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response, [
        {
          message: 'must be a recognised EWC code',
          pointer: '/wasteItems/0/classification/ewcCodes/0',
          errorType: 'InvalidValue'
        }
      ])
    })

    it('should reject a receipt without a delivery ID when more than 5 EWC codes are declared @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification.ewcCodes =
        beta2.ewcCodesBeyondMaximum()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response, [
        {
          message: 'must NOT have more than 5 items',
          pointer: '/wasteItems/0/classification/ewcCodes',
          errorType: 'OutOfRange'
        }
      ])
    })

    it('should reject a receipt without a delivery ID when hazardous waste has neither a consignment code nor a reason @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification = beta2.hazardousClassification()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response, [
        {
          message:
            "Required when a waste item declares hazardous properties, with a 'code' or a 'reasonForNoCode'",
          pointer: '/consignmentNote',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a receipt without a delivery ID when both a consignment code and a reason are given @allure.label.tag:DWTC-241', async () => {
      await addAllureLink('/DWTC-241', 'DWTC-241', 'jira')
      receiptData.wasteItems[0].classification = beta2.hazardousClassification()
      receiptData.consignmentNote = {
        ...beta2.consignmentNote(),
        ...beta2.consignmentNoteWithReason()
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
          receiptData
        )

      expectReceiptRejected(response, [
        {
          message: "Not allowed when 'code' is provided",
          pointer: '/consignmentNote/reasonForNoCode',
          errorType: 'NotAllowed'
        }
      ])
    })
  })
})
