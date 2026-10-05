import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Producer', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when a Household producer declares only the waste source @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateHouseholdMovementData()
        )

      expectMovementCreated(response)
    })

    it.each(beta2.commercialOrMunicipal)(
      'should create a movement when a %s producer is declared with all valid details @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            generateMovementData()
          )

        expectMovementCreated(response)
      }
    )

    it.each(beta2.commercialOrMunicipal)(
      'should create a movement when a %s producer gives a reason instead of an authorisation number @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        delete movementData.producer.authorisationNumber
        movementData.producer.reasonForNoAuthorisationNumber =
          'Exemption pending renewal'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementCreated(response)
      }
    )

    it('should create a movement when a Municipal producer omits the SIC code @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      const movementData = beta2.generateMunicipalMovementData()
      delete movementData.producer.sicCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it.each(beta2.acceptedPostcodes)(
      'should create a movement when a Commercial producer gives %s @allure.label.tag:DWTC-192',
      async (_postcodeKind, postcode) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.address.postcode = postcode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementCreated(response)
      }
    )

    it.each(beta2.acceptedPhoneNumbers)(
      'should create a movement when a Commercial producer gives %s @allure.label.tag:DWTC-192',
      async (_phoneKind, phoneNumber) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.contactDetails = { phoneNumber }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementCreated(response)
      }
    )

    it.each(beta2.acceptedEmailAddresses)(
      'should create a movement when a Commercial producer gives %s @allure.label.tag:DWTC-192',
      async (_emailKind, emailAddress) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.contactDetails = { emailAddress }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementCreated(response)
      }
    )

    it.each(beta2.acceptedAuthorisationNumbers)(
      'should create a movement when a Commercial producer gives %s @allure.label.tag:DWTC-192',
      async (_authorisationKind, authorisationNumber) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.authorisationNumber = authorisationNumber

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementCreated(response)
      }
    )
  })

  describe('Problem Responses', () => {
    it.each(beta2.commercialOrMunicipal)(
      'should reject a %s producer when the organisation name is missing @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        delete movementData.producer.organisationName

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it('should reject a Commercial producer when the SIC code is missing @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      const movementData = beta2.generateCommercialMovementData()
      delete movementData.producer.sicCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it.each(beta2.commercialOrMunicipal)(
      'should reject a %s producer when the address is missing @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        delete movementData.producer.address

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.commercialOrMunicipal)(
      'should reject a %s producer when neither an authorisation number nor a reason is given @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        delete movementData.producer.authorisationNumber

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.commercialOrMunicipal)(
      'should reject a %s producer when both an authorisation number and a reason are given @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        movementData.producer.reasonForNoAuthorisationNumber =
          'Exemption pending renewal'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.commercialOrMunicipal)(
      'should reject a %s producer when neither an email address nor a phone number is given @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        movementData.producer.contactDetails = {}

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it('should reject a Household producer when organisation, address, SIC code, authorisation number or contact details are supplied @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      const movementData = beta2.generateHouseholdMovementData()
      movementData.producer.organisationName = 'Acme'
      movementData.producer.sicCode = '38110'
      movementData.producer.authorisationNumber = 'EAS/P/123456'
      movementData.producer.address = {
        fullAddress: '10 Industrial Way, Test City',
        postcode: 'TE1 2PQ'
      }
      movementData.producer.contactDetails = {
        emailAddress: 'producer@example.com'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it.each(beta2.commercialOrMunicipal)(
      'should reject a %s producer when the SIC code is not five digits @allure.label.tag:DWTC-192',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = generateMovementData()
        movementData.producer.sicCode = '123'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.rejectedPostcodes)(
      'should reject a Commercial producer when the postcode is %s @allure.label.tag:DWTC-192',
      async (_postcodeKind, postcode) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.address.postcode = postcode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.rejectedPhoneNumbers)(
      'should reject a Commercial producer when the phone number has %s @allure.label.tag:DWTC-192',
      async (_phoneKind, phoneNumber) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.contactDetails = { phoneNumber }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.rejectedEmailAddresses)(
      'should reject a Commercial producer when the email address has %s @allure.label.tag:DWTC-192',
      async (_emailKind, emailAddress) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.contactDetails = { emailAddress }

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )

    it.each(beta2.rejectedAuthorisationNumbers)(
      'should reject a Commercial producer when the authorisation number is %s @allure.label.tag:DWTC-192',
      async (_authorisationKind, authorisationNumber) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        movementData.producer.authorisationNumber = authorisationNumber

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementRejected(response)
      }
    )
  })
})
