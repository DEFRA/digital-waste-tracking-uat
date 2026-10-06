import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - Special handling requirements', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when special handling requirements are exactly 500 characters @allure.label.tag:DWTC-157', async () => {
      await addAllureLink('/DWTC-157', 'DWTC-157', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.specialHandlingRequirements = 'A'.repeat(500)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a movement when special handling requirements are longer than 500 characters @allure.label.tag:DWTC-157', async () => {
      await addAllureLink('/DWTC-157', 'DWTC-157', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.specialHandlingRequirements = 'A'.repeat(501)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when special handling requirements are empty @allure.label.tag:DWTC-157', async () => {
      await addAllureLink('/DWTC-157', 'DWTC-157', 'jira')
      const movementData = beta2.generateBaseMovementData()
      movementData.specialHandlingRequirements = ''

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
