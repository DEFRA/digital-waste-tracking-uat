import { BaseAPI } from './base-api.js'
import { randomUUID } from 'crypto'

import { stsToken } from '../support/helpers/sts-token.js'

/** Default tenant service used by client-sync UAT flows. */
export const DEFAULT_TENANT_SERVICE_NAME = 'waste-movement-external-api'

/**
 * Client for the DWT client-sync service (list/get/create/delete/rotate/purge/replace clients and refresh cache).
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
   * Headers for a call to client-sync: an STS token when
   * CLIENT_SYNC_STS_AUDIENCE is set, basic auth otherwise.
   * @param {Record<string, string>} [extraHeaders={}] - Headers this call also needs
   * @returns {Promise<Record<string, string>>}
   */
  async #requestHeaders(extraHeaders = {}) {
    const audience = globalThis.testConfig.clientSyncStsAudience
    const credentials = `${DEFAULT_TENANT_SERVICE_NAME}:${globalThis.testConfig.serviceAuthPassword}`
    const requestHeaders = {
      Authorization: audience
        ? `Bearer ${await stsToken(audience)}`
        : `Basic ${Buffer.from(credentials).toString('base64')}`,
      ...extraHeaders,
      'x-cdp-request-id': randomUUID()
    }
    if (globalThis.testConfig.cdpDevApiKey != null) {
      requestHeaders['x-api-key'] = globalThis.testConfig.cdpDevApiKey
    }
    return requestHeaders
  }

  /**
   * GET /clients/{tenantServiceName} — list all clients for a tenant service.
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getClients(tenantServiceName = DEFAULT_TENANT_SERVICE_NAME) {
    const requestHeaders = await this.#requestHeaders()
    const { statusCode, headers, json } = await this.get(
      `/clients/${encodeURIComponent(tenantServiceName)}`,
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * GET /clients/{tenantServiceName}/{clientId} — get a single client.
   * @param {string} clientId - Cognito / software-provider client ID
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getClient(clientId, tenantServiceName = DEFAULT_TENANT_SERVICE_NAME) {
    const requestHeaders = await this.#requestHeaders()
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
    const requestHeaders = await this.#requestHeaders()
    const { statusCode, headers, json } = await this.post(
      '/clients/sync',
      undefined,
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * POST /clients/{tenantServiceName} — create a Cognito client and sync local cache.
   * @param {string} clientName - Display name for the new client
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async createClient(
    clientName,
    tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
  ) {
    const requestHeaders = await this.#requestHeaders({
      'Content-Type': 'application/json'
    })
    const { statusCode, headers, json } = await this.post(
      `/clients/${encodeURIComponent(tenantServiceName)}`,
      JSON.stringify({ clientName }),
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * DELETE /clients/{tenantServiceName}/{clientId} — delete Cognito client and local cache entry.
   * A successful delete is 204 with no body. Pass returnsNoContent so json is undefined.
   * Error responses are JSON, so leave returnsNoContent false for those calls.
   * @param {string} clientId - Cognito / software-provider client ID
   * @param {boolean} [returnsNoContent=false] - When true, do not parse the body and return json as undefined
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async deleteClient(
    clientId,
    returnsNoContent = false,
    tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
  ) {
    const requestHeaders = await this.#requestHeaders()
    const { statusCode, headers, json } = await this.delete(
      `/clients/${encodeURIComponent(tenantServiceName)}/${encodeURIComponent(clientId)}`,
      requestHeaders,
      returnsNoContent
    )
    return { statusCode, headers, json }
  }

  /**
   * POST /clients/{tenantServiceName}/{clientId}/rotate — rotate Cognito client secret.
   * @param {string} clientId - Cognito / software-provider client ID
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async rotateClientSecret(
    clientId,
    tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
  ) {
    const requestHeaders = await this.#requestHeaders({
      'Content-Type': 'application/json'
    })
    const { statusCode, headers, json } = await this.post(
      `/clients/${encodeURIComponent(tenantServiceName)}/${encodeURIComponent(clientId)}/rotate`,
      undefined,
      requestHeaders
    )
    return { statusCode, headers, json }
  }

  /**
   * POST /clients/{tenantServiceName}/{clientId}/purge — remove the oldest secret when two exist.
   * A successful purge is 204 with no body. Pass returnsNoContent so json is undefined.
   * Error responses are JSON, so leave returnsNoContent false for those calls.
   * @param {string} clientId - Cognito / software-provider client ID
   * @param {boolean} [returnsNoContent=false] - When true, do not parse the body and return json as undefined
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async purgeClientSecret(
    clientId,
    returnsNoContent = false,
    tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
  ) {
    const requestHeaders = await this.#requestHeaders({
      'Content-Type': 'application/json'
    })
    const { statusCode, headers, json } = await this.post(
      `/clients/${encodeURIComponent(tenantServiceName)}/${encodeURIComponent(clientId)}/purge`,
      undefined,
      requestHeaders,
      returnsNoContent
    )
    return { statusCode, headers, json }
  }

  /**
   * POST /clients/{tenantServiceName}/{clientId}/replace — rotate the secret, then purge the old one.
   * A successful replace returns the new credentials once. The response must not be cached.
   * @param {string} clientId - Cognito / software-provider client ID
   * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async replaceClientSecret(
    clientId,
    tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
  ) {
    const requestHeaders = await this.#requestHeaders({
      'Content-Type': 'application/json'
    })
    const { statusCode, headers, json } = await this.post(
      `/clients/${encodeURIComponent(tenantServiceName)}/${encodeURIComponent(clientId)}/replace`,
      undefined,
      requestHeaders
    )
    return { statusCode, headers, json }
  }
}
