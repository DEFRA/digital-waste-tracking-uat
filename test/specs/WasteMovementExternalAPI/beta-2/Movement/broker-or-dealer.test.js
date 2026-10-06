import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - Broker or dealer', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when broker or dealer involvement is declared as false @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: false }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one broker or dealer is declared @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = {
        isPresent: true,
        items: [
          beta2.generateBaseBrokerOrDealer(),
          beta2.generateSecondBrokerOrDealer()
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer is declared without an address @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = {
        isPresent: true,
        items: [beta2.generateBaseBrokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer gives an address @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      broker.address = beta2.generateBrokerAddress()
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer gives a reason instead of a registration number @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      delete broker.registrationNumber
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer gives only a phone number as contact @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      broker.contactDetails = { phoneNumber: beta2.brokerPhoneNumber }
      const movementData = beta2.generateBaseMovementData()
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
      const broker = beta2.generateBaseBrokerOrDealer()
      delete broker.organisationName
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when neither a registration number nor a reason is given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      delete broker.registrationNumber
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when both a registration number and a reason are given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      broker.reasonForNoRegistrationNumber = beta2.reasonForNoRegistrationNumber
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when the registration number is not a carrier registration number @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      broker.registrationNumber = 'NOT-A-REGISTRATION'
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when contact details are missing @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      delete broker.contactDetails
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a broker or dealer when neither an email address nor a phone number is given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      broker.contactDetails = {}
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it.each(beta2.rejectedEmailAddresses)(
      'should reject a broker or dealer when the email address has %s @allure.label.tag:DWTC-197',
      async (_emailKind, emailAddress) => {
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        const broker = beta2.generateBaseBrokerOrDealer()
        broker.contactDetails = { emailAddress }
        const movementData = beta2.generateBaseMovementData()
        movementData.brokerOrDealer = { isPresent: true, items: [broker] }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.rejectedPhoneNumbers)(
      'should reject a broker or dealer when the phone number has %s @allure.label.tag:DWTC-197',
      async (_phoneKind, phoneNumber) => {
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        const broker = beta2.generateBaseBrokerOrDealer()
        broker.contactDetails = { phoneNumber }
        const movementData = beta2.generateBaseMovementData()
        movementData.brokerOrDealer = { isPresent: true, items: [broker] }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.rejectedPostcodes)(
      'should reject a broker or dealer when the postcode is %s @allure.label.tag:DWTC-197',
      async (_postcodeKind, postcode) => {
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        const broker = beta2.generateBaseBrokerOrDealer()
        broker.address = beta2.generateBrokerAddress()
        broker.address.postcode = postcode
        const movementData = beta2.generateBaseMovementData()
        movementData.brokerOrDealer = { isPresent: true, items: [broker] }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it('should reject a broker or dealer when an address is given without a postcode @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBaseBrokerOrDealer()
      broker.address = beta2.generateBrokerAddress()
      delete broker.address.postcode
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [broker] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when a broker or dealer is declared as involved but no details are given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when a broker or dealer is declared as involved with an empty list @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when broker or dealer details are given but involvement is false @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = {
        isPresent: false,
        items: [beta2.generateBaseBrokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when broker or dealer details are given without declaring involvement @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.brokerOrDealer = {
        items: [beta2.generateBaseBrokerOrDealer()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
