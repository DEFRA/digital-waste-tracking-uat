import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Broker or dealer', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when broker or dealer involvement is declared as false @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealerNotInvolved()
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one broker or dealer is declared @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const secondBroker = beta2.generateBrokerOrDealerEntry()
      secondBroker.organisationName = 'Second Broker Ltd'
      secondBroker.registrationNumber = 'ROC UT 9999'
      secondBroker.contactDetails = { phoneNumber: '01112223333' }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(
            beta2.generateBrokerOrDealerEntry(),
            secondBroker
          )
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer is declared without an address @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      delete broker.address

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer gives a reason instead of a registration number @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      delete broker.registrationNumber
      broker.reasonForNoRegistrationNumber = 'One-off arrangement'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a broker or dealer gives only a phone number as contact @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      broker.contactDetails = { phoneNumber: '01112223333' }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a broker or dealer when the organisation name is missing @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      delete broker.organisationName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: '"organisationName" is required',
          pointer: '/brokerOrDealer/items/0/organisationName',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a broker or dealer when neither a registration number nor a reason is given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      delete broker.registrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: '"registrationNumber" is required',
          pointer: '/brokerOrDealer/items/0/registrationNumber',
          errorType: 'NotProvided'
        },
        {
          message: '"reasonForNoRegistrationNumber" is required',
          pointer: '/brokerOrDealer/items/0/reasonForNoRegistrationNumber',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a broker or dealer when both a registration number and a reason are given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      broker.reasonForNoRegistrationNumber = 'One-off arrangement'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: 'boolean schema is false',
          pointer: '/brokerOrDealer/items/0/registrationNumber',
          errorType: 'NotAllowed'
        },
        {
          message: 'boolean schema is false',
          pointer: '/brokerOrDealer/items/0/reasonForNoRegistrationNumber',
          errorType: 'NotAllowed'
        }
      ])
    })

    it('should reject a broker or dealer when the registration number is not a carrier registration number @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      broker.registrationNumber = 'NOT-A-REGISTRATION'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: beta2.registrationNumberFormatMessage,
          pointer: '/brokerOrDealer/items/0/registrationNumber',
          errorType: 'InvalidFormat'
        }
      ])
    })

    it('should reject a broker or dealer when contact details are missing @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      delete broker.contactDetails

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: '"contactDetails" is required',
          pointer: '/brokerOrDealer/items/0/contactDetails',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a broker or dealer when neither an email address nor a phone number is given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      broker.contactDetails = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: '"emailAddress" is required',
          pointer: '/brokerOrDealer/items/0/contactDetails/emailAddress',
          errorType: 'NotProvided'
        },
        {
          message: '"phoneNumber" is required',
          pointer: '/brokerOrDealer/items/0/contactDetails/phoneNumber',
          errorType: 'NotProvided'
        }
      ])
    })

    it.each(beta2.rejectedEmailAddresses)(
      'should reject a broker or dealer when the email address has %s @allure.label.tag:DWTC-197',
      async (_emailKind, emailAddress) => {
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        const broker = beta2.generateBrokerOrDealerEntry()
        broker.contactDetails = { emailAddress }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            beta2.generateMovementWithBrokerOrDealer(broker)
          )

        expectMovementRejected(response, [
          {
            message: beta2.emailFormatMessage,
            pointer: '/brokerOrDealer/items/0/contactDetails/emailAddress',
            errorType: 'InvalidFormat'
          }
        ])
      }
    )

    it.each(beta2.rejectedPhoneNumbers)(
      'should reject a broker or dealer when the phone number has %s @allure.label.tag:DWTC-197',
      async (_phoneKind, phoneNumber) => {
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        const broker = beta2.generateBrokerOrDealerEntry()
        broker.contactDetails = { phoneNumber }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            beta2.generateMovementWithBrokerOrDealer(broker)
          )

        expectMovementRejected(response, [
          {
            message: beta2.phoneFormatMessage,
            pointer: '/brokerOrDealer/items/0/contactDetails/phoneNumber',
            errorType: 'InvalidFormat'
          }
        ])
      }
    )

    it.each(beta2.rejectedPostcodes)(
      'should reject a broker or dealer when the postcode is %s @allure.label.tag:DWTC-197',
      async (_postcodeKind, postcode) => {
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        const broker = beta2.generateBrokerOrDealerEntry()
        broker.address.postcode = postcode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            beta2.generateMovementWithBrokerOrDealer(broker)
          )

        expectMovementRejected(response, [
          {
            message: beta2.postcodeFormatMessage,
            pointer: '/brokerOrDealer/items/0/address/postcode',
            errorType: 'InvalidFormat'
          }
        ])
      }
    )

    it('should reject a broker or dealer when an address is given without a postcode @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const broker = beta2.generateBrokerOrDealerEntry()
      delete broker.address.postcode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithBrokerOrDealer(broker)
        )

      expectMovementRejected(response, [
        {
          message: '"postcode" is required',
          pointer: '/brokerOrDealer/items/0/address/postcode',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a movement when a broker or dealer is declared as involved but no details are given @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateHouseholdMovementData()
      movementData.brokerOrDealer = { isPresent: true }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response, [
        {
          message: '"items" is required',
          pointer: '/brokerOrDealer/items',
          errorType: 'NotProvided'
        }
      ])
    })

    it('should reject a movement when a broker or dealer is declared as involved with an empty list @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateHouseholdMovementData()
      movementData.brokerOrDealer = { isPresent: true, items: [] }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response, [
        {
          message: 'must NOT have fewer than 1 items',
          pointer: '/brokerOrDealer/items',
          errorType: 'OutOfRange'
        }
      ])
    })

    it('should reject a movement when broker or dealer details are given but involvement is false @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateHouseholdMovementData()
      movementData.brokerOrDealer = {
        isPresent: false,
        items: [beta2.generateBrokerOrDealerEntry()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response, [
        {
          message: 'boolean schema is false',
          pointer: '/brokerOrDealer/items',
          errorType: 'NotAllowed'
        }
      ])
    })

    it('should reject a movement when broker or dealer details are given without declaring involvement @allure.label.tag:DWTC-197', async () => {
      await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
      const movementData = beta2.generateHouseholdMovementData()
      movementData.brokerOrDealer = {
        items: [beta2.generateBrokerOrDealerEntry()]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response, [
        {
          message: '"isPresent" is required',
          pointer: '/brokerOrDealer/isPresent',
          errorType: 'NotProvided'
        },
        {
          message: 'boolean schema is false',
          pointer: '/brokerOrDealer/items',
          errorType: 'NotAllowed'
        }
      ])
    })
  })
})
