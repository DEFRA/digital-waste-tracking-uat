import { BaseAPI } from './base-api.js'

export class WasteMovementExternalAPI extends BaseAPI {
  constructor() {
    super('https://waste-movement-external-api.dev.cdp-int.defra.cloud')
  }

  async createMovement(movementData) {
    const { statusCode, body } = await this.post('/movements', movementData)
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async updateMovement(movementId, movementData) {
    const { statusCode, body } = await this.patch(
      `/movements/${movementId}`,
      movementData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async addHazardousDetails(movementId, hazardousData) {
    const { statusCode, body } = await this.put(
      `/movements/${movementId}/hazardous`,
      hazardousData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }

  async addPopsDetails(movementId, popsData) {
    const { statusCode, body } = await this.put(
      `/movements/${movementId}/pops`,
      popsData
    )
    const responseData = await body.json()

    return {
      statusCode,
      data: responseData
    }
  }
}
