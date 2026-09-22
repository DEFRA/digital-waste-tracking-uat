import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 Movement Creation', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta1.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it(
      'should successfully create a new movement with only required fields' +
        ' @allure.label.tag:DWTC-117',
      async () => {
        await addAllureLink('/DWTC-117', 'DWTC-117', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty(
          'data.movementId',
          expect.any(String)
        )
      }
    )
  })
})

