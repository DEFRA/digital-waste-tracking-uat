import { describe, it, expect } from '@jest/globals'

// Skip tests if authentication is disabled in the test config
const describeOnlyIfAuthDisabled =
  globalThis.testConfig?.isAuthDisabled === true ? describe.skip : describe
describeOnlyIfAuthDisabled('OAuth2 Client Credentials Authentication', () => {
  describe('Successful authentication with valid credentials', () => {
    it('should authenticate successfully with valid client credentials', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        globalThis.testConfig.cognitoClientId,
        globalThis.testConfig.cognitoClientSecret
      )

      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('access_token')
      expect(response.json).toHaveProperty('expires_in')
      expect(response.json).toHaveProperty('token_type')
    })
  })

  describe('Failed authentication with invalid client ID', () => {
    it('should fail authentication with invalid client ID', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        'err000000000000000000000r',
        globalThis.testConfig.cognitoClientSecret
      )

      expect(response.statusCode).toBe(400)
      expect(response.json).toHaveProperty('error')
      expect(response.json.error).toBe('invalid_client')
    })
  })

  describe('Failed authentication with invalid client secret', () => {
    it('should fail authentication with invalid client secret', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        globalThis.testConfig.cognitoClientId,
        'err000000000000000000000000000000000000000000000000r'
      )

      expect(response.statusCode).toBe(400)
      expect(response.json).toHaveProperty('error')
      expect(response.json.error).toBe('invalid_client')
    })
  })
})
