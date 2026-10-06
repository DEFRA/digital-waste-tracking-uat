import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - All fields', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it.each(beta2.movementsWithAllFields)(
      'should create a movement when a %s producer, a broker or dealer, supporting references and special handling requirements are all declared @allure.label.tag:DWTC-192 @allure.label.tag:DWTC-197 @allure.label.tag:DWTC-156 @allure.label.tag:DWTC-157',
      async (_wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
        await addAllureLink('/DWTC-157', 'DWTC-157', 'jira')
        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            generateMovementData()
          )

        expectMovementCreated(response)
      }
    )
  })
})
