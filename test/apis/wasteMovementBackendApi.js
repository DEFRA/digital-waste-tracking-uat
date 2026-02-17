import { BaseAPI } from './base-api.js'

export class WasteMovementBackendAPI extends BaseAPI {
  constructor() {
    super(globalThis.testConfig.wasteMovementBackendApiBaseUrl, false)
  }

  /**
   * Bulk upload waste movements (backend service auth).
   * @param {string} bulkUploadId - Unique ID for the bulk upload
   * @param {Array<Object>} movements - Array of movement payloads (backend shape: with submittingOrganisation, no apiCode)
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async bulkUpload(bulkUploadId, movements) {
    const credentials = `waste-organisation-backend:${globalThis.testConfig.wasteOrganisationsBackendToWasteMovementBackendPassword}`
    const base64Credentials = Buffer.from(credentials).toString('base64')
    const requestHeaders = {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json'
    }
    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }
    const { statusCode, headers, json } = await this.post(
      `/bulk/${bulkUploadId}/movements/receive`,
      JSON.stringify(movements),
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async retryAuditLog(requestBody) {
    // Create Basic Authorization header with base64 encoded credentials
    const credentials = `waste-movement-external-api:${globalThis.testConfig.wasteMovementExternalApiToWasteMovementBackendPassword}`
    const base64Credentials = Buffer.from(credentials).toString('base64')

    // Set the correct headers for OAuth token requests
    const requestHeaders = {
      Authorization: `Basic ${base64Credentials}`,
      'Content-Type': 'application/json'
    }

    // Only add the CDP Dev API key if it is set. This is only need for running locally.
    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
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
