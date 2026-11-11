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

describe('Beta-2 Delivery Creation - Delivery site', () => {
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
    it('should create a delivery when a valid delivery date and time, regulatory position statement, site name, full address and postcode are given @allure.label.tag:DWTC-240', async () => {
      await addAllureLink('/DWTC-240', 'DWTC-240', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])
      deliveryData.deliverySite.rpsNumbers = beta2.rpsNumbers()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })

    it('should create a delivery when the full address and regulatory position statement are not given @allure.label.tag:DWTC-240', async () => {
      await addAllureLink('/DWTC-240', 'DWTC-240', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])
      delete deliveryData.deliverySite.address.fullAddress

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })
  })

  describe('Problem Responses', () => {
    it('should reject a delivery when the delivery date and time, site name and postcode are missing @allure.label.tag:DWTC-240', async () => {
      await addAllureLink('/DWTC-240', 'DWTC-240', 'jira')
      const movementId = await createMovementWithCollection()
      deliveryData = beta2.generateBaseDeliveryData([movementId])
      delete deliveryData.deliveryDateTime
      delete deliveryData.deliverySite.organisationName
      delete deliveryData.deliverySite.address.postcode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response, [
        {
          message: "'deliveryDateTime' is required",
          pointer: '/deliveryDateTime',
          errorType: 'NotProvided'
        },
        {
          message: "'organisationName' is required",
          pointer: '/deliverySite/organisationName',
          errorType: 'NotProvided'
        },
        {
          message: "'postcode' is required",
          pointer: '/deliverySite/address/postcode',
          errorType: 'NotProvided'
        }
      ])
    })
  })
})
