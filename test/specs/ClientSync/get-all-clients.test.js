import { describe, it, expect, beforeEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

describe('Get all clients from DWT Client Sync Service', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-334', 'DWTA-334', 'jira')
  })

  describe('Valid tenant service name', () => {
    it(
      'should return at least the primary and secondary Cognito clients' +
        ' @allure.label.tag:DWTA-334',
      async () => {
        const { statusCode, json: clients } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients()

        expect(statusCode).toBe(200)
        expect(clients.length).toBeGreaterThanOrEqual(2)

        const unexpectedTenant = clients.find(
          (client) => client.tenantServiceName !== DEFAULT_TENANT_SERVICE_NAME
        )
        expect(unexpectedTenant).toBeUndefined()

        const primaryClient = clients.find(
          (client) => client.clientId === globalThis.testConfig.cognitoClientId
        )
        // Cognito may retain a second secret after rotation on shared clients
        expect(primaryClient.secrets.length).toBeGreaterThanOrEqual(1)
        expect(primaryClient.secrets.length).toBeLessThanOrEqual(2)
        const primarySecretMatcher = {
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}\+00:00$/
          ),
          id: expect.stringMatching(
            new RegExp(
              `^${globalThis.testConfig.cognitoClientId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}--\\d+$`
            )
          )
        }
        expect(primaryClient).toEqual({
          clientName: globalThis.testConfig.cognitoClientName,
          clientId: globalThis.testConfig.cognitoClientId,
          tenantServiceName: DEFAULT_TENANT_SERVICE_NAME,
          secrets: Array.from(
            { length: primaryClient.secrets.length },
            () => primarySecretMatcher
          )
        })

        const secondaryClient = clients.find(
          (client) => client.clientId === globalThis.testConfig.cognitoClientId2
        )
        expect(secondaryClient.secrets.length).toBeGreaterThanOrEqual(1)
        expect(secondaryClient.secrets.length).toBeLessThanOrEqual(2)
        const secondarySecretMatcher = {
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}\+00:00$/
          ),
          id: expect.stringMatching(
            new RegExp(
              `^${globalThis.testConfig.cognitoClientId2.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}--\\d+$`
            )
          )
        }
        expect(secondaryClient).toEqual({
          clientName: globalThis.testConfig.cognitoClientName2,
          clientId: globalThis.testConfig.cognitoClientId2,
          tenantServiceName: DEFAULT_TENANT_SERVICE_NAME,
          secrets: Array.from(
            { length: secondaryClient.secrets.length },
            () => secondarySecretMatcher
          )
        })
      }
    )
  })

  describe('Unknown tenant service name', () => {
    it(
      'should return 404 when tenantServiceName is not found' +
        ' @allure.label.tag:DWTA-334',
      async () => {
        const tenantServiceName = 'unknown-tenant-service'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients(
            tenantServiceName
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: `Tenant service '${tenantServiceName}' is not managed by dwt-client-sync`
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
        const tenantServiceName = 'Waste-Movement-External-API'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients(
            tenantServiceName
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: `Tenant service '${tenantServiceName}' is not managed by dwt-client-sync`
        })
      }
    )
  })
})
