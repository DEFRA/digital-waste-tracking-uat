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

describe('Beta-2 Receipt Creation - Treatments', () => {
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
    it('should create a receipt when a treatment with a valid disposal or recovery code and weight is declared @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptCreated(response, deliveryId)
    })

    it('should create a receipt when more than one treatment is declared @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      receiptData.treatments = [beta2.treatment(), beta2.secondTreatment()]
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
    it('should reject a receipt when no treatment is declared @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      delete receiptData.treatments
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receipt when treatments are an empty list @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      receiptData.treatments = []
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    it('should reject a receipt when any one of several treatments has missing details @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      const invalidTreatment = beta2.secondTreatment()
      delete invalidTreatment.weight
      receiptData.treatments = [beta2.treatment(), invalidTreatment]
      const deliveryId = await createDeliveryForReceipt()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithDeliveryId(
          deliveryId,
          receiptData
        )

      expectReceiptRejected(response, deliveryId)
    })

    // Required fields removed for required-field error assertions
    it('should reject a receipt when a treatment is missing all required fields @allure.label.tag:DWTC-238', async () => {
      await addAllureLink('/DWTC-238', 'DWTC-238', 'jira')
      const treatment = beta2.treatment()
      delete treatment.disposalOrRecoveryCode
      treatment.weight = {}
      receiptData.treatments = [treatment]
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
