import { BaseAPI } from './base-api.js'
import { randomUUID } from 'crypto'

export class WasteOrganisationBackendAPI extends BaseAPI {
  constructor() {
    super(globalThis.testConfig.wasteOrganisationBackendApiBaseUrl, false)
    // Create Basic Authorization header with base64 encoded credentials
    const credentials = `waste-movement-external-api:${globalThis.testConfig.serviceAuthPassword}`
    this.base64Credentials = Buffer.from(credentials).toString('base64')
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getOrganisationByApiCode(apiCode) {
    const requestHeaders = {
      Authorization: `Basic ${this.base64Credentials}`,
      'Content-Type': 'application/json'
    }

    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }

    const { statusCode, headers, json } = await this.get(
      `/organisation/${apiCode}`,
      requestHeaders
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
  async createApiCodeForOrganisation(organisationId) {
    const requestHeaders = {
      Authorization: `Basic ${this.base64Credentials}`,
      'Content-Type': 'application/json',
      'x-cdp-request-id': randomUUID()
    }

    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }

    const { statusCode, headers, json } = await this.post(
      `/organisation/${organisationId}/apiCodes`,
      JSON.stringify({
        name: `UAT - Organisation Name - ID:${organisationId} - Created: ${Date.now()}`
      }),
      requestHeaders
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
  async disableApiCodeForOrganisation(organisationId, apiCode) {
    const requestHeaders = {
      Authorization: `Basic ${this.base64Credentials}`,
      'Content-Type': 'application/json',
      'x-cdp-request-id': randomUUID()
    }

    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }

    const { statusCode, headers, json } = await this.put(
      `/organisation/${organisationId}/apiCodes/${apiCode}`,
      JSON.stringify({
        apiCode: {
          isDisabled: true
        }
      }),
      requestHeaders
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
  async getAllApiCodesForOrganisation(organisationId) {
    const requestHeaders = {
      Authorization: `Basic ${this.base64Credentials}`,
      'Content-Type': 'application/json'
    }

    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }

    const { statusCode, headers, json } = await this.get(
      `/organisation/${organisationId}/apiCodes`,
      requestHeaders
    )

    return {
      statusCode,
      headers,
      json
    }
  }
}
