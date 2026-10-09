import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2/movement.js'
import {
  expectCollectionCreated,
  expectCollectionRejected
} from '~/test/support/helpers/beta-2/collection.js'

describe('Beta-2 Collection Creation - Broker or dealer', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta2.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a collection when no broker or dealer details are submitted @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')

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

    it('should create a collection when broker or dealer involvement is declared as false @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      collectionData.brokerOrDealer = { isPresent: false }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })

    it('should create a collection when more than one broker or dealer is declared @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const broker = beta2.brokerOrDealer()
      broker.address = beta2.brokerOrDealerAddress()
      collectionData.brokerOrDealer = {
        isPresent: true,
        items: [broker, beta2.secondBrokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })

    it('should create a collection when a broker or dealer gives a reason instead of a registration number @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')

      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateBaseMovementData()
        )
      expectMovementCreated(createResponse)
      const movementId = createResponse.json.data.movementId

      const broker = beta2.brokerOrDealer()
      delete broker.registrationNumber
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      collectionData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          movementId,
          collectionData
        )

      expectCollectionCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a broker or dealer when the organisation name is missing @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')
      const broker = beta2.brokerOrDealer()
      delete broker.organisationName
      collectionData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a broker or dealer when neither a registration number nor a reason is given @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')
      const broker = beta2.brokerOrDealer()
      delete broker.registrationNumber
      collectionData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a broker or dealer when both a registration number and a reason are given @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')
      const broker = beta2.brokerOrDealer()
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      collectionData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a broker or dealer when neither an email address nor a phone number is given @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')
      const broker = beta2.brokerOrDealer()
      broker.contactDetails = {}
      collectionData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a collection when a broker or dealer is declared as involved but no details are given @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')
      collectionData.brokerOrDealer = { isPresent: true }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })

    it('should reject a collection when broker or dealer details are given but involvement is false @allure.label.tag:DWTC-211', async () => {
      await addAllureLink('/DWTC-211', 'DWTC-211', 'jira')
      collectionData.brokerOrDealer = {
        isPresent: false,
        items: [beta2.brokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createCollection(
          beta2.unknownResourceId,
          collectionData
        )

      expectCollectionRejected(response, beta2.unknownResourceId)
    })
  })
})
