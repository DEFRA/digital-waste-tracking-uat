import { BaseAPI } from './base-api.js'

export class WasteMovementBackendAPI extends BaseAPI {
  constructor() {
    super(globalThis.testConfig.wasteMovementBackendApiBaseUrl, false)
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async retryAuditLog(password, requestBody) {
    // Create Basic Authorization header with base64 encoded credentials
    const credentials = `waste-movement-external-api:${password}`
    const base64Credentials = Buffer.from(credentials).toString('base64')

    // Set the correct headers for OAuth token requests
    const requestHeaders = {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json'
    }

    const { statusCode, headers, json } = await this.post(
      '/movements/retry-audit-log',
      JSON.stringify(requestBody),
      requestHeaders
    )

    return {
      statusCode,
      headers,
      json
    }
  }
}
