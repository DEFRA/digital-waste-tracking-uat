import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectedClientWithSecrets } from '~/test/support/helpers/client-sync.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

describe('Replace a client secret in DWT Client Sync Service', () => {
  let createdClientId

  beforeEach(async () => {
    await addAllureLink('/DWTSPI-527', 'DWTSPI-527', 'jira')
    createdClientId = undefined
  })

  afterEach(async () => {
    if (createdClientId) {
      await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
        createdClientId,
        true
      )
    }
  })

  describe('Valid secret replacement', () => {
    it(
      'should replace the only secret, leave one secret metadata entry, and reject the old secret' +
        ' @allure.label.tag:DWTSPI-527',
      async () => {
        const clientName = `UAT_Replace_${Date.now()}`
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            clientName
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId
        const originalSecret = created.clientSecret

        const { statusCode: beforeReplaceGetStatus, json: beforeReplace } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(beforeReplaceGetStatus).toBe(200)
        expect(beforeReplace).toEqual(
          expectedClientWithSecrets(clientName, createdClientId, 1)
        )

        const {
          statusCode,
          json: replaced,
          headers
        } = await globalThis.apis.wasteMovementClientSyncAPI.replaceClientSecret(
          createdClientId
        )

        expect(statusCode).toBe(200)
        expect(replaced).toEqual({
          clientName,
          clientId: createdClientId,
          clientSecret: expect.any(String)
        })
        expect(replaced).not.toHaveProperty('secrets')
        expect(replaced.clientSecret).not.toBe(originalSecret)
        expect(headers['cache-control']).toBe('no-store')

        const expectedClient = expectedClientWithSecrets(
          clientName,
          createdClientId,
          1
        )

        const { statusCode: getStatus, json: client } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(getStatus).toBe(200)
        expect(client).toEqual(expectedClient)

        const { statusCode: syncStatus } =
          await globalThis.apis.wasteMovementClientSyncAPI.syncClients()
        expect(syncStatus).toBe(200)

        const { statusCode: getAfterSyncStatus, json: clientAfterSync } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(getAfterSyncStatus).toBe(200)
        expect(clientAfterSync).toEqual(expectedClient)

        const { statusCode: newAuthStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            replaced.clientId,
            replaced.clientSecret
          )
        expect(newAuthStatus).toBe(200)

        const { statusCode: oldAuthStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            created.clientId,
            originalSecret
          )
        expect(oldAuthStatus).toBe(400)
      }
    )
  })

  describe('Invalid secret replacement', () => {
    it(
      'should return 404 when clientId is not found' +
        ' @allure.label.tag:DWTSPI-527',
      async () => {
        const clientId = 'unknownclientid123'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.replaceClientSecret(
            clientId
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: `Client '${clientId}' not found for tenant service '${DEFAULT_TENANT_SERVICE_NAME}'`
        })
      }
    )

    it(
      'should return 400 when tenantServiceName does not match the required pattern' +
        ' @allure.label.tag:DWTSPI-527',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.replaceClientSecret(
            'my_client_id',
            'Not_A_Service'
          )

        expect(statusCode).toBe(400)
        expect(json).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message:
            '"tenantServiceName" with value "Not_A_Service" fails to match the required pattern: /^[a-z0-9-]+$/',
          validation: {
            source: 'params',
            keys: ['tenantServiceName']
          }
        })
      }
    )

    it(
      'should return 400 when clientId does not match the required pattern' +
        ' @allure.label.tag:DWTSPI-527',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.replaceClientSecret(
            'not.a.client'
          )

        expect(statusCode).toBe(400)
        expect(json).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message:
            '"clientId" with value "not.a.client" fails to match the required pattern: /^[\\w+]+$/',
          validation: {
            source: 'params',
            keys: ['clientId']
          }
        })
      }
    )

    it(
      'should return 404 when tenantServiceName is not managed, but clientId is valid' +
        ' @allure.label.tag:DWTSPI-527',
      async () => {
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_Replace_BadTenant_${Date.now()}`
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId

        const unknownTenantServiceName = 'unknown-tenant-service'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.replaceClientSecret(
            createdClientId,
            unknownTenantServiceName
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: `Tenant service '${unknownTenantServiceName}' is not managed by dwt-client-sync`
        })
      }
    )
  })
})
