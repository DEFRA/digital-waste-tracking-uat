import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

// Client sync names the service in this 404 from DWTA-465. Accept 'Not Found'
// until that's deployed everywhere, then drop it
const unknownTenantMessages = (tenantServiceName) => [
  'Not Found',
  `Tenant service '${tenantServiceName}' is not managed by dwt-client-sync`
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
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            tenantServiceName,
            'unknown-client-id'
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found'
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
