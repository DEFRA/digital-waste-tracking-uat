import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

describe('Get a single client from DWT Client Sync Service', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-333', 'DWTA-333', 'jira')
  })

  describe('Valid client ID', () => {
    it(
      'should return the primary Cognito client' +
        ' @allure.label.tag:DWTA-333',
      async () => {
        const { statusCode, json: client } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            globalThis.testConfig.cognitoClientId
          )

        expect(statusCode).toBe(200)
        expect(Array.isArray(client)).toBe(false)
        expect(client).toEqual({
          clientName: globalThis.testConfig.cognitoClientName,
          clientId: globalThis.testConfig.cognitoClientId,
          tenantServiceName: DEFAULT_TENANT_SERVICE_NAME
        })
      }
    )
  })

  describe('Unknown client ID', () => {
    it(
      'should return 404 when clientId is not found' +
        ' @allure.label.tag:DWTA-333',
      async () => {
        const clientId = 'unknown-client-id'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(clientId)

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: `Client '${clientId}' not found for tenant service '${DEFAULT_TENANT_SERVICE_NAME}'`
        })
      }
    )
  })

  describe('Valid clientId but unknown tenant service name', () => {
    it(
      'should return 404 when tenantServiceName is not found, but clientId is valid' +
        ' @allure.label.tag:DWTA-333',
      async () => {
        const unknownTenantServiceName = 'unknown-tenant-service'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            globalThis.testConfig.cognitoClientId,
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
