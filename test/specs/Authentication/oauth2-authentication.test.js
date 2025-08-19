import { describe, it, expect } from '@jest/globals'

describe('OAuth2 Client Credentials Authentication', () => {
  describe('Successful authentication with valid credentials', () => {
    it('should authenticate successfully with valid client credentials', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        global.testConfig.cognitoClientId,
        global.testConfig.cognitoClientSecret
      )

      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('access_token')
      expect(response.data).toHaveProperty('expires_in')
      expect(response.data).toHaveProperty('token_type')
    })
  })

  describe('Failed authentication with invalid client ID', () => {
    it('should fail authentication with invalid client ID', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        'err000000000000000000000r',
        global.testConfig.cognitoClientSecret
      )

      expect(response.statusCode).toBe(400)
      expect(response.data).toHaveProperty('error')
      expect(response.data.error).toBe('invalid_client')
    })
  })

  describe('Failed authentication with invalid client secret', () => {
    it('should fail authentication with invalid client secret', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        global.testConfig.cognitoClientId,
        'err000000000000000000000000000000000000000000000000r'
      )

      expect(response.statusCode).toBe(400)
      expect(response.data).toHaveProperty('error')
      expect(response.data.error).toBe('invalid_client')
    })
  })
})
