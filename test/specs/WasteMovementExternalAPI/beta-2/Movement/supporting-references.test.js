import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - Supporting references', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when more than one supporting reference is provided @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      movementData.supportingReferences = beta2.supportingReferences()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a supporting reference when the label and reference are not both given @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.supportingReference()
      delete supportingReference.label
      movementData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a supporting reference when the reference is longer than 50 characters @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.reference = 'A'.repeat(51)
      movementData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when supporting references are an empty list @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      movementData.supportingReferences = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a supporting reference when the label is not recognised @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.supportingReference()
      supportingReference.label = 'Purchase order'
      movementData.supportingReferences = [supportingReference]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
