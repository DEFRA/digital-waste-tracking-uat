import { expect } from '@jest/globals'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

/**
 * Syncs the client-sync cache, then asserts the Cognito client is present.
 * @param {string} clientId - Cognito client id returned from create
 * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
 * @returns {Promise<Object>} Cached client record
 */
export async function ensureClientExistsAfterSync(
  clientId,
  tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
) {
  await globalThis.apis.wasteMovementClientSyncAPI.syncClients()

  const { statusCode, json: client } =
    await globalThis.apis.wasteMovementClientSyncAPI.getClient(
      clientId,
      tenantServiceName
    )

  expect(statusCode).toBe(200)
  expect(client.clientId).toBe(clientId)
  return client
}

/**
 * Syncs the client-sync cache, then asserts the Cognito client is absent.
 * @param {string} clientId - Cognito client id
 * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
 * @returns {Promise<void>}
 */
export async function ensureClientDoesNotExistAfterSync(
  clientId,
  tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
) {
  await globalThis.apis.wasteMovementClientSyncAPI.syncClients()

  const { statusCode, json } =
    await globalThis.apis.wasteMovementClientSyncAPI.getClient(
      clientId,
      tenantServiceName
    )

  expect(statusCode).toBe(404)
  expect(json).toEqual({
    statusCode: 404,
    error: 'Not Found',
    message: `Client '${clientId}' not found for tenant service '${tenantServiceName}'`
  })
}
