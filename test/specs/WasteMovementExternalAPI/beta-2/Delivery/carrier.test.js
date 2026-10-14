import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import { expectCollectionCreated } from '~/test/support/helpers/beta-2/collection.js'
import {
  expectDeliveryCreated,
  expectDeliveryRejected
} from '~/test/support/helpers/beta-2/delivery.js'

describe('Beta-2 Delivery Creation - Carrier', () => {
  let deliveryData

  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  async function createMovementWithCollection() {
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

    return movementId
  }

  describe('Successful Creation', () => {
    it('should create a delivery when a carrier with valid details is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })

    it('should create a delivery when a carrier gives a reason instead of a registration number @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])
      delete deliveryData.carrier.registrationNumber
      deliveryData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })
  })

  describe('Problem Responses', () => {
    it('should reject a delivery when more than one carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])
      deliveryData.carrier = [beta2.carrier(), beta2.secondIntendedCarrier()]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a delivery when no carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])
      delete deliveryData.carrier

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })
  })
})
