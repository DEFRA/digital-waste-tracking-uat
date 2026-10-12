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
    deliveryData = beta2.generateBaseDeliveryData([beta2.unknownResourceId])
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a delivery when a carrier with valid details is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')

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

      deliveryData = beta2.generateBaseDeliveryData([movementId])

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryCreated(response, [movementId])
    })

    it('should create a delivery when a carrier gives a reason instead of a registration number @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')

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

    it('should create a delivery when a carrier transports by other means with a description @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')

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

      deliveryData = beta2.generateBaseDeliveryData([movementId])
      deliveryData.carrier.meansOfTransport = 'Other'
      delete deliveryData.carrier.vehicleRegistration
      deliveryData.carrier.otherMeansOfTransport = beta2.otherMeansOfTransport

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
      deliveryData.carrier = [beta2.carrier(), beta2.secondIntendedCarrier()]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a delivery when no carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete deliveryData.carrier

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier when the organisation name is missing @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete deliveryData.carrier.organisationName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier when the means of transport is missing @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete deliveryData.carrier.meansOfTransport
      delete deliveryData.carrier.vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier when neither a registration number nor a reason is given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete deliveryData.carrier.registrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier when both a registration number and a reason are given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      deliveryData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier transporting by road without a vehicle registration @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete deliveryData.carrier.vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier transporting by other means without a description @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      deliveryData.carrier.meansOfTransport = 'Other'
      delete deliveryData.carrier.vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })

    it('should reject a carrier when neither an email address nor a phone number is given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      deliveryData.carrier.contactDetails = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createDelivery(
          deliveryData
        )

      expectDeliveryRejected(response)
    })
  })
})
