import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - Intended carriers', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    movementData.intendedCarriers = [beta2.intendedCarrier()]
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when an intended carrier with all valid details is declared @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      movementData.intendedCarriers[0].address = beta2.intendedCarrierAddress()
      movementData.intendedCarriers[0].contactDetails.phoneNumber =
        '01234567890'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one intended carrier is declared @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      const carrier = beta2.intendedCarrier()
      carrier.address = beta2.intendedCarrierAddress()
      movementData.intendedCarriers = [carrier, beta2.secondIntendedCarrier()]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when an intended carrier is declared without an address @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when an intended carrier gives a reason instead of a registration number @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      delete movementData.intendedCarriers[0].registrationNumber
      movementData.intendedCarriers[0].reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when an intended carrier transports by other means with a description @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      movementData.intendedCarriers[0].meansOfTransport = 'Other'
      delete movementData.intendedCarriers[0].vehicleRegistration
      movementData.intendedCarriers[0].otherMeansOfTransport = 'Horse and cart'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a movement when no intended carrier is declared @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      delete movementData.intendedCarriers

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when intended carriers are an empty list @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      movementData.intendedCarriers = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier when the organisation name is missing @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      delete movementData.intendedCarriers[0].organisationName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier when the means of transport is missing @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      delete movementData.intendedCarriers[0].meansOfTransport
      delete movementData.intendedCarriers[0].vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier when neither a registration number nor a reason is given @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      delete movementData.intendedCarriers[0].registrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier when both a registration number and a reason are given @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      movementData.intendedCarriers[0].reasonForNoRegistrationNumber =
        beta2.reasonForNoCarrierRegistrationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier transporting by road without a vehicle registration @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      delete movementData.intendedCarriers[0].vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier transporting by other means without a description @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      movementData.intendedCarriers[0].meansOfTransport = 'Other'
      delete movementData.intendedCarriers[0].vehicleRegistration

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended carrier when neither an email address nor a phone number is given @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')
      movementData.intendedCarriers[0].contactDetails = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
