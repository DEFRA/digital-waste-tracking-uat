import { BaseAPI } from './base-api.js'

export class WasteMovementExternalAPI extends BaseAPI {
  constructor() {
    super(
      `https://waste-movement-external-api.${global.env}.cdp-int.defra.cloud`
    )
  }

  async getSwagger() {
    const { statusCode, responseHeaders, body } = await this.get('/')

    if (responseHeaders['content-type'] === 'application/json') {
      const responseData = await body.json()
      return {
        statusCode,
        responseHeaders,
        data: responseData
      }
    } else {
      return {
        statusCode,
        responseHeaders,
        data: body
      }
    }
  }

  async receiveMovement(movementData) {
    const { statusCode, responseHeaders, body } = await this.post(
      '/movements/receive',
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json' }
    )
    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }

  async receiveMovementWithId(wasteTrackingId, movementData) {
    const { statusCode, responseHeaders, body } = await this.put(
      `/movements/${wasteTrackingId}/receive`,
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json' }
    )
    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }

  async getHealth() {
    const { statusCode, responseHeaders, body } = await this.get('/health')
    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }
}
