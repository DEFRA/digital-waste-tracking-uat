describe('Gateway API', () => {
  describe('Authentication', () => {
    test('should authenticate with the correct credentials', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        global.testConfig.cognitoClientId,
        global.testConfig.cognitoClientSecret
      )
      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('access_token')
      expect(response.data).toHaveProperty('expires_in')
      expect(response.data).toHaveProperty('token_type')
    })
    test('should fail to authenticate with invalid client id', async () => {
      const response = await globalThis.apis.cognitoOAuthApi.authenticate(
        'err000000000000000000000r',
        global.testConfig.cognitoClientSecret
      )
      expect(response.statusCode).toBe(400)
      expect(response.data).toHaveProperty('error')
      expect(response.data.error).toBe('invalid_client')
    })
    test('should fail to authenticate with invalid client secret', async () => {
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
