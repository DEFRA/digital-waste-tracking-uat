import { BaseAPI } from './base-api.js'
import { randomUUID } from 'crypto'

export class WasteOrganisationBackendAPI extends BaseAPI {
  /**
   * @param {boolean} [useProxyWhenAvailable=false] - When true, honours HTTP_PROXY.
   */
  constructor(useProxyWhenAvailable = false) {
    super(
      globalThis.testConfig.wasteOrganisationBackendApiBaseUrl,
      useProxyWhenAvailable
    )
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
   * Create or update an organisation with a disabledAfter date in the future by default.
   * If disabledAfter is provided, it will be used instead of the default of 1 year from now.
   * @param {string} userId - User ID
   * @param {string} organisationId - Organisation ID
   * @param {string} [disabledAfter] - Optional ISO/date string for organisation.disableAfter
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async createOrUpdateOrganisation(userId, organisationId, disabledAfter) {
    const requestHeaders = {
      Authorization: `Basic ${this.base64Credentials}`,
      'Content-Type': 'application/json',
      'x-cdp-request-id': randomUUID()
    }

    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }

    const disableAfter = disabledAfter
      ? new Date(disabledAfter).toISOString()
      : new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 365 * 1 // 1 year from now
        ).toISOString()

    const { statusCode, headers, json } = await this.put(
      `/user/${userId}/organisation/${organisationId}`,
      JSON.stringify({
        organisation: {
          disableAfter
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
