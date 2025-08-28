import { testConfig } from '../support/test-config.js'
import { BaseAPI } from './base-api.js'

export class CognitoOAuthApi extends BaseAPI {
  constructor() {
    super(testConfig.cognitoOAuthBaseUrl)
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async authenticate(clientId, clientSecret) {
    // Create Basic Authorization header with base64 encoded credentials
    const credentials = `${clientId}:${clientSecret}`
    const base64Credentials = Buffer.from(credentials).toString('base64')

    // Prepare the request body for client credentials flow
    const requestBody = this.buildFormData({
      grant_type: 'client_credentials'
    })

    // Set the correct headers for OAuth token requests
    const requestHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64Credentials}`
    }

    // Make the token request
    const { statusCode, headers, body } = await this.post(
      '/oauth2/token',
      requestBody,
      requestHeaders
    )

    const json = await body.json()
    // Consume the body to close the connection
    await body.dump()

    return {
      statusCode,
      headers,
      json
    }
  }
}
