import { expect } from '@jest/globals'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

const CREATED_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}\+00:00$/

/**
 * Matcher for one cached secret metadata entry (id and createdAt only).
 * @param {string} clientId - Cognito client id
 * @returns {{ createdAt: Object, id: Object }}
 */
export function expectedSecretMatcher(clientId) {
  return {
    createdAt: expect.stringMatching(CREATED_AT_PATTERN),
    id: expect.stringMatching(
      new RegExp(`^${clientId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}--\\d+$`)
    )
  }
}

/**
 * Expected GET client body with a fixed number of secret metadata entries.
 * @param {string} clientName - Cognito client name
 * @param {string} clientId - Cognito client id
 * @param {number} secretsCount - Expected secrets array length (1 or 2)
 * @param {string} [tenantServiceName=DEFAULT_TENANT_SERVICE_NAME] - Tenant service name
 * @returns {Object}
 */
export function expectedClientWithSecrets(
  clientName,
  clientId,
  secretsCount,
  tenantServiceName = DEFAULT_TENANT_SERVICE_NAME
) {
  return {
    clientName,
    clientId,
    tenantServiceName,
    secrets: Array.from({ length: secretsCount }, () =>
      expectedSecretMatcher(clientId)
    )
  }
}

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
