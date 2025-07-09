import { BaseAPI } from './base-api.js'

export class CognitoOAuthApi extends BaseAPI {
  constructor() {
    super(
      `https://waste-movement-external-api-c63f2.auth.eu-west-2.amazoncognito.com`
    )
  }

  async authenticate(clientId, clientSecret) {
    // Create Basic Authorization header with base64 encoded credentials
    const credentials = `${clientId}:${clientSecret}`
    const base64Credentials = Buffer.from(credentials).toString('base64')

    // Prepare the request body for client credentials flow
    const requestBody = {
      grant_type: 'client_credentials'
    }

    // Set the correct headers for OAuth token requests
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64Credentials}`
    }

    // Make the token request
    const { statusCode, responseHeaders, body } = await this.post(
      '/oauth2/token',
      this.buildFormData(requestBody),
      headers
    )

    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }
}
