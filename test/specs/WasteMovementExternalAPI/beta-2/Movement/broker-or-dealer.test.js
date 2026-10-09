import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Broker or dealer', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when broker or dealer involvement is declared as false @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      movementData.brokerOrDealer = { isPresent: false }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one broker or dealer is declared @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.brokerOrDealer()
      broker.address = beta2.brokerOrDealerAddress()
      movementData.brokerOrDealer = {
        isPresent: true,
        items: [broker, beta2.secondBrokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer gives a reason instead of a registration number @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.brokerOrDealer()
      delete broker.registrationNumber
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a broker or dealer when the organisation name is missing @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.brokerOrDealer()
      delete broker.organisationName
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when neither a registration number nor a reason is given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.brokerOrDealer()
      delete broker.registrationNumber
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when both a registration number and a reason are given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.brokerOrDealer()
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when neither an email address nor a phone number is given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.brokerOrDealer()
      broker.contactDetails = {}
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when a broker or dealer is declared as involved but no details are given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      movementData.brokerOrDealer = { isPresent: true }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when broker or dealer details are given but involvement is false @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      movementData.brokerOrDealer = {
        isPresent: false,
        items: [beta2.brokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
