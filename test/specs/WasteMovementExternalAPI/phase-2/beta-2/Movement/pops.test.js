import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Persistent organic pollutants', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when the waste is declared as not containing POPs @allure.label.tag:DWTC-223', async () => {
      await addAllureLink('/DWTC-223', 'DWTC-223', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a POP is declared with an amount and source @allure.label.tag:DWTC-223', async () => {
      await addAllureLink('/DWTC-223', 'DWTC-223', 'jira')
      movementData.wasteItems[0].classification.pops = beta2.popsPresent()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one POP is declared @allure.label.tag:DWTC-223', async () => {
      await addAllureLink('/DWTC-223', 'DWTC-223', 'jira')
      movementData.wasteItems[0].classification.pops = {
        ...beta2.popsPresent(),
        components: [
          beta2.popComponentWithAmount(),
          beta2.popComponentWithThreshold()
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a movement when POPs are missing all required fields @allure.label.tag:DWTC-223', async () => {
      await addAllureLink('/DWTC-223', 'DWTC-223', 'jira')
      const pops = beta2.popsPresent()
      delete pops.componentsSource
      delete pops.components
      movementData.wasteItems[0].classification.pops = pops

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when POP details are given for waste declared as not containing POPs @allure.label.tag:DWTC-223', async () => {
      await addAllureLink('/DWTC-223', 'DWTC-223', 'jira')
      movementData.wasteItems[0].classification.pops = {
        ...beta2.popsNotPresent(),
        componentsSource: beta2.popsPresent().componentsSource,
        components: beta2.popsPresent().components
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
