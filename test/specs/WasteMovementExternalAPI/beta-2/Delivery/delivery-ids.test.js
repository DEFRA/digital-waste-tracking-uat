import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import { expectCollectionCreated } from '~/test/support/helpers/beta-2/collection.js'
import {
  expectDeliveriesCreated,
  expectDeliveryMovementIdsNotRecognised
} from '~/test/support/helpers/beta-2/delivery.js'

describe('Beta-2 Delivery Creation - Delivery IDs', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  /**
   * Creates a movement, records its collection, and returns the movement ID.
   * @param {Object} [movementData] - Movement payload. Defaults to a non-hazardous base.
   * @returns {Promise<string>}
   */
  async function createCollectedMovement(
    movementData = beta2.generateBaseMovementData()
  ) {
    const createResponse =
      await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
        movementData
      )
    expectMovementCreated(createResponse)
    const movementId = createResponse.json.data.movementId

    const collectionResponse =
      await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
        movementId,
        beta2.generateBaseCollectionData()
      )
    expectCollectionCreated(collectionResponse)

    return movementId
  }

  /**
   * Creates a hazardous movement with a consignment note, then collects it.
   * @returns {Promise<string>}
   */
  async function createCollectedHazardousMovement() {
    const movementData = beta2.generateBaseMovementData()
    movementData.wasteItems[0].classification = beta2.hazardousClassification()
    movementData.consignmentNote = beta2.consignmentNote()
    return createCollectedMovement(movementData)
  }

  describe('Successful Creation', () => {
    it('should create one delivery ID when more than one non-hazardous movement is submitted @allure.label.tag:DWTC-248', async () => {
      await addAllureLink('/DWTC-248', 'DWTC-248', 'jira')
      const firstMovementId = await createCollectedMovement()
      const secondMovementId = await createCollectedMovement()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          beta2.generateBaseDeliveryData([firstMovementId, secondMovementId])
        )

      expectDeliveriesCreated(response, [
        {
          deliveryId: expect.any(String),
          movementIds: [firstMovementId, secondMovementId],
          wasteType: 'NON_HAZARDOUS'
        }
      ])
    })

    it('should create one delivery ID per hazardous movement when more than one hazardous movement is submitted @allure.label.tag:DWTC-248', async () => {
      await addAllureLink('/DWTC-248', 'DWTC-248', 'jira')
      const firstHazardousMovementId = await createCollectedHazardousMovement()
      const secondHazardousMovementId = await createCollectedHazardousMovement()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          beta2.generateBaseDeliveryData([
            firstHazardousMovementId,
            secondHazardousMovementId
          ])
        )

      expectDeliveriesCreated(response, [
        {
          deliveryId: firstHazardousMovementId,
          movementIds: [firstHazardousMovementId],
          wasteType: 'HAZARDOUS'
        },
        {
          deliveryId: secondHazardousMovementId,
          movementIds: [secondHazardousMovementId],
          wasteType: 'HAZARDOUS'
        }
      ])
    })

    it('should create one aggregated delivery ID for non-hazardous movements and one delivery ID per hazardous movement @allure.label.tag:DWTC-248', async () => {
      await addAllureLink('/DWTC-248', 'DWTC-248', 'jira')
      const nonHazardousMovementId = await createCollectedMovement()
      const hazardousMovementId = await createCollectedHazardousMovement()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          beta2.generateBaseDeliveryData([
            nonHazardousMovementId,
            hazardousMovementId
          ])
        )

      expectDeliveriesCreated(response, [
        {
          deliveryId: expect.any(String),
          movementIds: [nonHazardousMovementId],
          wasteType: 'NON_HAZARDOUS'
        },
        {
          deliveryId: hazardousMovementId,
          movementIds: [hazardousMovementId],
          wasteType: 'HAZARDOUS'
        }
      ])
    })
  })

  describe('Problem Responses', () => {
    it('should reject a delivery when a movement ID is not recognised @allure.label.tag:DWTC-248', async () => {
      await addAllureLink('/DWTC-248', 'DWTC-248', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          beta2.generateBaseDeliveryData([beta2.unknownResourceId])
        )

      expectDeliveryMovementIdsNotRecognised(response, [
        beta2.unknownResourceId
      ])
    })
  })
})
