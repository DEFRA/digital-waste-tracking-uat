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

  async addHazardousDetails(wasteTrackingId, hazardousData) {
    const { statusCode, responseHeaders, body } = await this.put(
      `/movements/${wasteTrackingId}/receive/hazardous`,
      JSON.stringify(hazardousData),
      { 'Content-Type': 'application/json' }
    )
    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }

  async addPopsDetails(wasteTrackingId, popsData) {
    const { statusCode, responseHeaders, body } = await this.put(
      `/movements/${wasteTrackingId}/pops`,
      JSON.stringify(popsData),
      { 'Content-Type': 'application/json' }
    )
    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }

  async addPeprDetails(wasteTrackingId, peprData) {
    const { statusCode, responseHeaders, body } = await this.put(
      `/movements/${wasteTrackingId}/pepr`,
      JSON.stringify(peprData),
      { 'Content-Type': 'application/json' }
    )
    const responseData = await body.json()

    return {
      statusCode,
      responseHeaders,
      data: responseData
    }
  }
}
