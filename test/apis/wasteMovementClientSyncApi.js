import { BaseAPI } from './base-api.js'
import { randomUUID } from 'crypto'

/**
 * Client for the DWT client-sync service (list/get clients and refresh cache).
 */
export class WasteMovementClientSyncAPI extends BaseAPI {
  /**
   * @param {boolean} [useProxyWhenAvailable=false] - When true, honours HTTP_PROXY.
   */
  constructor(useProxyWhenAvailable = false) {
    super(
      globalThis.testConfig.wasteMovementClientSyncApiBaseUrl,
      useProxyWhenAvailable
    )
  }

  /**
   * GET /clients/{tenantServiceName} — list all clients for a tenant service.
   * @param {string} tenantServiceName - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getClients(tenantServiceName) {
    const credentials = `waste-movement-backend:${globalThis.testConfig.serviceAuthPasswordClientSync}`
    const base64Credentials = Buffer.from(credentials).toString('base64')
    const requestHeaders = {
      Authorization: `Basic ${base64Credentials}`,
      'x-cdp-request-id': randomUUID()
    }
    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }
    const { statusCode, headers, json } = await this.get(
      `/clients/${encodeURIComponent(tenantServiceName)}`,
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * GET /clients/{tenantServiceName}/{clientId} — get a single client.
   * @param {string} tenantServiceName - Tenant service name
   * @param {string} clientId - Cognito / software-provider client ID
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getClient(tenantServiceName, clientId) {
    const credentials = `waste-movement-backend:${globalThis.testConfig.serviceAuthPasswordClientSync}`
    const base64Credentials = Buffer.from(credentials).toString('base64')
    const requestHeaders = {
      Authorization: `Basic ${base64Credentials}`,
      'x-cdp-request-id': randomUUID()
    }
    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }
    const { statusCode, headers, json } = await this.get(
      `/clients/${encodeURIComponent(tenantServiceName)}/${encodeURIComponent(clientId)}`,
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * POST /clients/sync — refresh the clients database from the latest source.
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async syncClients() {
    const credentials = `waste-movement-backend:${globalThis.testConfig.serviceAuthPasswordClientSync}`
    const base64Credentials = Buffer.from(credentials).toString('base64')
    const requestHeaders = {
      Authorization: `Basic ${base64Credentials}`,
      'x-cdp-request-id': randomUUID()
    }
    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }
    const { statusCode, headers, json } = await this.post(
      '/clients/sync',
      undefined,
      requestHeaders
    )
    return { statusCode, headers, json }
  }
}
