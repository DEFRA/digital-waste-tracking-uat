import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../support/helpers/auth.js'

describe('Waste Movement API', () => {
  beforeEach(async () => {
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('API Documentation and Health', () => {
    it('should return health check response', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.getHealth()

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        message: 'success'
      })
    })
  })
})
