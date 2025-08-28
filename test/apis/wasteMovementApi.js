import { BaseAPI } from './base-api.js'

export class WasteMovementExternalAPI extends BaseAPI {
  constructor() {
    super(
      `https://waste-movement-external-api.${globalThis.testConfig.environment}.cdp-int.defra.cloud`
    )
  }

  /**
   * @returns {Promise<import('./base-api.js').HtmlResponse>}
   */
  async getSwagger() {
    const { statusCode, headers, body } = await this.get('/')

    const html = await body.text()
    // Consume the body to close the connection
    await body.dump()

    return {
      statusCode,
      headers,
      html
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async receiveMovement(movementData) {
    const { statusCode, headers, body } = await this.post(
      '/movements/receive',
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json' }
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

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async receiveMovementWithId(wasteTrackingId, movementData) {
    const { statusCode, headers, body } = await this.put(
      `/movements/${wasteTrackingId}/receive`,
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json' }
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

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getHealth() {
    const { statusCode, headers, body } = await this.get('/health')

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
