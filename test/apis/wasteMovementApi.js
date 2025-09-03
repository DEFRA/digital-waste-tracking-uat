import { BaseAPI } from './base-api.js'

export class WasteMovementExternalAPI extends BaseAPI {
  constructor() {
    super(
      `https://waste-movement-external-api.api.${globalThis.testConfig.environment}.cdp-int.defra.cloud`,
      false
    )
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async receiveMovement(movementData) {
    const { statusCode, headers, json } = await this.post(
      '/movements/receive',
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json' }
    )

    return {
      statusCode,
      headers,
      json
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async receiveMovementWithId(wasteTrackingId, movementData) {
    const { statusCode, headers, json } = await this.put(
      `/movements/${wasteTrackingId}/receive`,
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json' }
    )

    return {
      statusCode,
      headers,
      json
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getHealth() {
    const { statusCode, headers, json } = await this.get('/health')

    return {
      statusCode,
      headers,
      json
    }
  }
}
