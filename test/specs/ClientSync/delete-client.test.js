import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
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
          message: 'Not Found'
        })

        await ensureClientDoesNotExistAfterSync(clientId)
      }
    )
  })

  describe('Invalid client deletion', () => {
    it(
      'should return 404 when clientId is not found' +
        ' @allure.label.tag:DWTA-444',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
            'unknownclientid123'
          )

        expect(statusCode).toBe(404)
        expect(json).toEqual({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found'
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

        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
            createdClientId,
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
})
