import { BaseAPI } from './base-api.js'

export class WasteMovementBackendAPI extends BaseAPI {
  constructor() {
    super(globalThis.testConfig.wasteMovementBackendApiBaseUrl, false)
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async retryAuditLog(requestBody) {
    const { statusCode, headers, json } = await this.post(
      '/movements/retry-audit-log',
      JSON.stringify(requestBody),
      { 'Content-Type': 'application/json' }
    )

    return {
      statusCode,
      headers,
      json
    }
  }
}
