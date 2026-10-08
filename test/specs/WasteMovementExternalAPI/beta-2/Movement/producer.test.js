import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Producer', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
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
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a Commercial producer is declared @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducerWithOptionalValues()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a Commercial producer gives a reason instead of an authorisation number @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      delete movementData.producer.authorisationNumber
      movementData.producer.reasonForNoAuthorisationNumber =
        beta2.reasonForNoAuthorisationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a Municipal producer omits the SIC code @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.municipalProducer()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a Commercial producer when the organisation name is missing @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      delete movementData.producer.organisationName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a Commercial producer when the SIC code is missing @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      delete movementData.producer.sicCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a Commercial producer when the address is missing @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      delete movementData.producer.address

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a Commercial producer when neither an authorisation number nor a reason is given @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      delete movementData.producer.authorisationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a Commercial producer when both an authorisation number and a reason are given @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      movementData.producer.reasonForNoAuthorisationNumber =
        beta2.reasonForNoAuthorisationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a Commercial producer when neither an email address nor a phone number is given @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducer()
      movementData.producer.contactDetails = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a Household producer when organisation, address, SIC code, authorisation number or contact details are supplied @allure.label.tag:DWTC-192', async () => {
      await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
      movementData.producer = beta2.commercialProducerWithOptionalValues()
      movementData.producer.wasteSource = 'Household'
      delete movementData.producer.contactDetails.phoneNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
