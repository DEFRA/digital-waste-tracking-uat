import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'

describe('Beta-1 Authentication @Authentication', () => {
  let movementData

  beforeEach(() => {
    movementData = beta1.generateBaseMovementData()
  })

  // 401 is returned by the API Gateway authorizer, not the waste-movement API.
  describe('Invalid Authentication', () => {
    it(
      'should reject creating a beta-1 movement with an invalid authentication token' +
        ' @Authentication',
      async () => {
        globalThis.apis.wasteMovementExternalAPI.setAuthToken(
          'invalid-token-12345'
        )

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(401)
      }
    )

    it(
      'should reject creating a beta-1 movement when the authentication token is missing' +
        ' @Authentication',
      async () => {
        globalThis.apis.wasteMovementExternalAPI.setAuthToken(undefined)

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(401)
      }
    )
  })
})
