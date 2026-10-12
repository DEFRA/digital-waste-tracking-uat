import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2/collection.js'

describe('Beta-2 Collection Creation - Carrier', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta2.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a collection when a carrier with valid details is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })

    it('should create a collection when a carrier gives a reason instead of a registration number @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete collectionData.carrier.registrationNumber
      collectionData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })

    it('should create a collection when a carrier transports by other means with a description @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      collectionData.carrier.meansOfTransport = 'Other'
      delete collectionData.carrier.vehicleRegistration
      collectionData.carrier.otherMeansOfTransport = beta2.otherMeansOfTransport

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a collection when more than one carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      collectionData.carrier = [beta2.carrier(), beta2.secondIntendedCarrier()]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a collection when no carrier is declared @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete collectionData.carrier

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier when the organisation name is missing @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete collectionData.carrier.organisationName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier when the means of transport is missing @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete collectionData.carrier.meansOfTransport
      delete collectionData.carrier.vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier when neither a registration number nor a reason is given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete collectionData.carrier.registrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier when both a registration number and a reason are given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      collectionData.carrier.reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier transporting by road without a vehicle registration @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      delete collectionData.carrier.vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier transporting by other means without a description @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      collectionData.carrier.meansOfTransport = 'Other'
      delete collectionData.carrier.vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a carrier when neither an email address nor a phone number is given @allure.label.tag:DWTC-158', async () => {
      await addAllureLink('/DWTC-158', 'DWTC-158', 'jira')
      collectionData.carrier.contactDetails = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })
  })
})
