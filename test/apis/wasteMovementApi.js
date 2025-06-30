import { BaseAPI } from './base-api.js'

export class WasteMovementExternalAPI extends BaseAPI {
  constructor() {
    super(
      `https://waste-movement-external-api.${global.env}.cdp-int.defra.cloud`
    )
  }

  async receiveMovement(movementData) {
    const { statusCode, body } = await this.post(
      '/movements/receive',
      movementData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async receiveMovementWithId(wasteTrackingId, movementData) {
    const { statusCode, body } = await this.put(
      `/movements/${wasteTrackingId}/receive`,
      movementData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async addHazardousDetails(wasteTrackingId, hazardousData) {
    const { statusCode, body } = await this.put(
      `/movements/${wasteTrackingId}/receive/hazardous`,
      hazardousData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async addPopsDetails(wasteTrackingId, popsData) {
    const { statusCode, body } = await this.put(
      `/movements/${wasteTrackingId}/pops`,
      popsData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async addPeprDetails(wasteTrackingId) {
    const { statusCode, body } = await this.put(
      `/movements/${wasteTrackingId}/pepr`
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }
}
