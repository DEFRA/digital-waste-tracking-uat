import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'

describe('Beta-2 Authentication @Authentication', () => {
  let movementData

  beforeEach(() => {
    movementData = beta2.generateBaseMovementData()
  })

  // 401 is returned by the API Gateway authorizer, not the waste-movement API.
  describe('Invalid Authentication', () => {
    it(
      'should reject creating a beta-2 movement with an invalid authentication token' +
        ' @Authentication',
      async () => {
        globalThis.apis.wasteMovementExternalAPI.setAuthToken(
          'invalid-token-12345'
        )

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(401)
      }
    )

    it(
      'should reject creating a beta-2 movement when the authentication token is missing' +
        ' @Authentication',
      async () => {
        globalThis.apis.wasteMovementExternalAPI.setAuthToken(undefined)

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(401)
      }
    )
  })
})
