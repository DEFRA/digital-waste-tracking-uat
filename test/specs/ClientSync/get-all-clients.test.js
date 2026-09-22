import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Get all clients from DWT Client Sync Service', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-334', 'DWTA-334', 'jira')
  })

  describe('Valid tenant service name', () => {
    it(
      'should return at least the two UAT Cognito clients for waste-movement-backend' +
        ' @allure.label.tag:DWTA-334',
      async () => {
        const tenantServiceName = 'waste-movement-backend'
        const { statusCode, json: clients } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients(
            tenantServiceName
          )

        expect(statusCode).toBe(200)
        expect(clients.length).toBeGreaterThanOrEqual(2)

        const unexpectedTenant = clients.find(
          (client) => client.tenantServiceName !== tenantServiceName
        )
        expect(unexpectedTenant).toBeUndefined()

        expect(
          clients.find(
            (client) =>
              client.clientId === globalThis.testConfig.cognitoClientId
          )
        ).toEqual({
          clientName: globalThis.testConfig.cognitoClientName,
          clientId: globalThis.testConfig.cognitoClientId,
          tenantServiceName
        })

        expect(
          clients.find(
            (client) =>
              client.clientId === globalThis.testConfig.cognitoClientId2
          )
        ).toEqual({
          clientName: globalThis.testConfig.cognitoClientName2,
          clientId: globalThis.testConfig.cognitoClientId2,
          tenantServiceName
        })
      }
    )
  })

  describe('Unknown tenant service name', () => {
    it(
      'should return 404 when tenantServiceName is not found' +
        ' @allure.label.tag:DWTA-334',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients(
            'unknown-tenant-service'
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

  describe('Empty tenant service name', () => {
    it(
      'should return 404 when tenantServiceName is empty' +
        ' @allure.label.tag:DWTA-334',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients('')

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found'
        })
      }
    )
  })

  describe('Tenant service name casing', () => {
    it(
      'should return 404 when tenantServiceName casing does not match' +
        ' @allure.label.tag:DWTA-334',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients(
            'Waste-Movement-Backend'
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
