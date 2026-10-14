import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Intended carriers', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when an intended carrier with valid details is declared @allure.label.tag:DWTC-199', async () => {
      await addAllureLink('/DWTC-199', 'DWTC-199', 'jira')

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
  })
})
