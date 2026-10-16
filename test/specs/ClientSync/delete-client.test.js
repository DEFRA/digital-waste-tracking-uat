import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'
import { ensureClientDoesNotExistAfterSync } from '~/test/support/helpers/client-sync.js'

describe('Delete a client from DWT Client Sync Service', () => {
  let createdClientId

  beforeEach(async () => {
    await addAllureLink('/DWTA-444', 'DWTA-444', 'jira')
    createdClientId = undefined
  })

  afterEach(async () => {
    if (createdClientId) {
      await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
        createdClientId
      )
    }
  })

  describe('Valid client deletion', () => {
    it(
      'should delete a client from Cognito and local mongo' +
        ' @allure.label.tag:DWTA-444',
      async () => {
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_Delete_${Date.now()}`
          )

        expect(createStatus).toBe(200)
        const clientId = created.clientId

        const { statusCode: getStatusBeforeDelete } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(clientId)
        expect(getStatusBeforeDelete).toBe(200)

        const { statusCode: deleteStatus, json: deleteBody } =
          await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
            clientId
          )

        expect(deleteStatus).toBe(204)
        expect(deleteBody).toBeNull()

        const { statusCode: getStatus, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(clientId)

        expect(getStatus).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: `Client '${clientId}' not found for tenant service '${DEFAULT_TENANT_SERVICE_NAME}'`
        })

        await ensureClientDoesNotExistAfterSync(clientId)
      }
    )

    it(
      'should not allow authentication after the client is deleted' +
        ' @allure.label.tag:DWTA-444',
      async () => {
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_Delete_Auth_${Date.now()}`
          )

        expect(createStatus).toBe(200)
        const { clientId, clientSecret } = created

        const { statusCode: authBeforeDelete } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            clientId,
            clientSecret
          )
        expect(authBeforeDelete).toBe(200)

        const { statusCode: deleteStatus } =
          await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
            clientId
          )
        expect(deleteStatus).toBe(204)

        const { statusCode: authAfterDelete } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            clientId,
            clientSecret
          )
        expect(authAfterDelete).toBe(400)
      }
    )
  })

  describe('Invalid client deletion', () => {
    it(
      'should return 404 when clientId is not found' +
        ' @allure.label.tag:DWTA-444',
      async () => {
        const clientId = 'unknownclientid123'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
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
      'should return 404 when tenantServiceName is not found, but clientId is valid' +
        ' @allure.label.tag:DWTA-444',
      async () => {
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_Delete_BadTenant_${Date.now()}`
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId

        const unknownTenantServiceName = 'unknown-tenant-service'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
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
