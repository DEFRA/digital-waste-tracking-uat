import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

// Client sync names the service and client in these 404s from DWTA-465.
// Accept 'Not Found' until that's deployed everywhere, then drop it
const unknownTenantMessages = (tenantServiceName) => [
  'Not Found',
  `Tenant service '${tenantServiceName}' is not managed by dwt-client-sync`
]
const unknownClientMessages = (tenantServiceName, clientId) => [
  'Not Found',
  `Client '${clientId}' not found for tenant service '${tenantServiceName}'`
]

describe('Get a single client from DWT Client Sync Service', () => {
  const tenantServiceName = 'waste-movement-external-api'

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
            tenantServiceName,
            globalThis.testConfig.cognitoClientId
          )

        expect(statusCode).toBe(200)
        expect(Array.isArray(client)).toBe(false)
        expect(client).toEqual({
          clientName: globalThis.testConfig.cognitoClientName,
          clientId: globalThis.testConfig.cognitoClientId,
          tenantServiceName
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
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            tenantServiceName,
            clientId
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: expect.any(String)
        })
        expect(unknownClientMessages(tenantServiceName, clientId)).toContain(
          json.message
        )
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
            unknownTenantServiceName,
            globalThis.testConfig.cognitoClientId
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: expect.any(String)
        })
        expect(unknownTenantMessages(unknownTenantServiceName)).toContain(
          json.message
        )
      }
    )
  })
})
