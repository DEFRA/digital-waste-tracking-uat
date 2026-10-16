import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

describe('Sync clients from DWT Client Sync Service', () => {
  let createdClientId

  beforeEach(async () => {
    await addAllureLink('/DWTA-335', 'DWTA-335', 'jira')
    createdClientId = undefined
  })

  afterEach(async () => {
    if (createdClientId) {
      await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
        createdClientId
      )
    }
  })

  describe('Successful sync with cognito service to get client details', () => {
    it(
      'should return 200 when clients are synced' +
        ' @allure.label.tag:DWTA-335',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.syncClients()

        expect(statusCode).toBe(200)
        expect(json).toEqual({
          result: {
            totalServicesProcessed: expect.any(Number),
            services: [
              {
                serviceName: DEFAULT_TENANT_SERVICE_NAME,
                credentialsSynced: expect.any(Number)
              }
            ]
          }
        })
      }
    )

    it(
      'should increase credentialsSynced by 1 after creating a client' +
        ' @allure.label.tag:DWTA-335',
      async () => {
        const { statusCode: initialSyncStatus, json: initialSync } =
          await globalThis.apis.wasteMovementClientSyncAPI.syncClients()

        expect(initialSyncStatus).toBe(200)
        const initialCredentialsSynced =
          initialSync.result.services[0].credentialsSynced

        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_Sync_${Date.now()}`
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId

        const { statusCode: secondSyncStatus, json: secondSync } =
          await globalThis.apis.wasteMovementClientSyncAPI.syncClients()

        expect(secondSyncStatus).toBe(200)
        expect(secondSync).toEqual({
          result: {
            totalServicesProcessed: expect.any(Number),
            services: [
              {
                serviceName: DEFAULT_TENANT_SERVICE_NAME,
                credentialsSynced: initialCredentialsSynced + 1
              }
            ]
          }
        })
      }
    )
  })
})
