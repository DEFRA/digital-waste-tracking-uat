import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Get a single client from DWT Client Sync Service', () => {
  const tenantServiceName = 'waste-movement-backend'

  beforeEach(async () => {
    await addAllureLink('/DWTA-333', 'DWTA-333', 'jira')
  })

  describe('Valid client ID', () => {
    it(
      'should return the primary UAT Cognito client for waste-movement-backend' +
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

  describe('Unknown tenant service name', () => {
    it(
      'should return 404 when tenantServiceName is not found, but clientId is valid' +
        ' @allure.label.tag:DWTA-333',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            'unknown-tenant-service',
            globalThis.testConfig.cognitoClientId
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
})
