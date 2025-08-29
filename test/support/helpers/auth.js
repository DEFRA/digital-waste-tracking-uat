/**
 * Helper function to authenticate with Cognito OAuth and set the auth token
 * @param {string} clientId - The Cognito client ID
 * @param {string} clientSecret - The Cognito client secret
 * @returns {Promise<Object>} The authentication response
 */
async function authenticateAndSetToken(clientId, clientSecret) {
  // Get a valid authentication token from Cognito OAuth
  const authResponse = await globalThis.apis.cognitoOAuthApi.authenticate(
    clientId,
    clientSecret
  )

  expect(authResponse.statusCode).toBe(200)
  expect(authResponse.json).toHaveProperty('access_token')

  // Set the valid authentication token
  globalThis.apis.wasteMovementExternalAPI.setAuthToken(
    authResponse.json.access_token
  )

  return authResponse
}

export { authenticateAndSetToken }
