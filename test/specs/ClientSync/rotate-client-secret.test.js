import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectedClientWithSecrets } from '~/test/support/helpers/client-sync.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

describe('Rotate a client secret in DWT Client Sync Service', () => {
  let createdClientId

  beforeEach(async () => {
    await addAllureLink('/DWTA-445', 'DWTA-445', 'jira')
    await addAllureLink('/DWTSPI-498', 'DWTSPI-498', 'jira')
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

  describe('Valid secret rotation', () => {
    it(
      'should rotate the client secret, expose two secret metadata entries, and allow authentication with the new secret' +
        ' @allure.label.tag:DWTA-445 @allure.label.tag:DWTSPI-498',
      async () => {
        const clientName = `UAT_Rotate_${Date.now()}`
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            clientName
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId
        const originalSecret = created.clientSecret

        const { statusCode: beforeRotateGetStatus, json: beforeRotate } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(beforeRotateGetStatus).toBe(200)
        expect(beforeRotate).toEqual(
          expectedClientWithSecrets(clientName, createdClientId, 1)
        )
        const previousNewestCreatedAt = beforeRotate.secrets[0].createdAt

        const {
          statusCode,
          json: rotated,
          headers
        } = await globalThis.apis.wasteMovementClientSyncAPI.rotateClientSecret(
          createdClientId
        )

        expect(statusCode).toBe(200)
        expect(rotated).toEqual({
          clientName,
          clientId: createdClientId,
          clientSecret: expect.any(String)
        })
        expect(rotated).not.toHaveProperty('secrets')
        expect(rotated.clientSecret).not.toBe(originalSecret)
        expect(headers['cache-control']).toBe('no-store')

        const expectedClient = expectedClientWithSecrets(
          clientName,
          createdClientId,
          2
        )

        const { statusCode: getStatus, json: client } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(getStatus).toBe(200)
        expect(client).toEqual(expectedClient)

        const newestCreatedAt = client.secrets
          .map((secret) => secret.createdAt)
          .sort()
          .at(-1)
        expect(Date.parse(newestCreatedAt)).toBeGreaterThanOrEqual(
          Date.parse(previousNewestCreatedAt)
        )

        const { statusCode: listStatus, json: clients } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClients()
        expect(listStatus).toBe(200)
        expect(
          clients.find((listed) => listed.clientId === createdClientId)
        ).toEqual(expectedClient)

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
            rotated.clientId,
            rotated.clientSecret
          )
        expect(newAuthStatus).toBe(200)

        const { statusCode: oldAuthStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            created.clientId,
            originalSecret
          )
        expect(oldAuthStatus).toBe(200)
      }
    )

    it(
      'should invalidate the original secret after rotating twice and keep two secret metadata entries' +
        ' @allure.label.tag:DWTA-445 @allure.label.tag:DWTSPI-498',
      async () => {
        const clientName = `UAT_RotateTwice_${Date.now()}`
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            clientName
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId
        const originalSecret = created.clientSecret

        const { statusCode: firstRotateStatus, json: firstRotated } =
          await globalThis.apis.wasteMovementClientSyncAPI.rotateClientSecret(
            createdClientId
          )

        expect(firstRotateStatus).toBe(200)
        expect(firstRotated).not.toHaveProperty('secrets')
        expect(firstRotated.clientSecret).not.toBe(originalSecret)

        const { statusCode: afterFirstGetStatus, json: afterFirstRotate } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(afterFirstGetStatus).toBe(200)
        expect(afterFirstRotate).toEqual(
          expectedClientWithSecrets(clientName, createdClientId, 2)
        )
        const secretIdsAfterFirstRotate = afterFirstRotate.secrets.map(
          (secret) => secret.id
        )

        const { statusCode: secondRotateStatus, json: secondRotated } =
          await globalThis.apis.wasteMovementClientSyncAPI.rotateClientSecret(
            createdClientId
          )

        expect(secondRotateStatus).toBe(200)
        expect(secondRotated).not.toHaveProperty('secrets')
        expect(secondRotated.clientSecret).not.toBe(originalSecret)
        expect(secondRotated.clientSecret).not.toBe(firstRotated.clientSecret)

        const { statusCode: afterSecondGetStatus, json: afterSecondRotate } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(afterSecondGetStatus).toBe(200)
        expect(afterSecondRotate).toEqual(
          expectedClientWithSecrets(clientName, createdClientId, 2)
        )
        expect(
          afterSecondRotate.secrets.map((secret) => secret.id)
        ).not.toEqual(secretIdsAfterFirstRotate)

        const { statusCode: originalAuthStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            createdClientId,
            originalSecret
          )
        expect(originalAuthStatus).toBe(400)

        const { statusCode: firstRotatedAuthStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            createdClientId,
            firstRotated.clientSecret
          )
        expect(firstRotatedAuthStatus).toBe(200)

        const { statusCode: secondRotatedAuthStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            createdClientId,
            secondRotated.clientSecret
          )
        expect(secondRotatedAuthStatus).toBe(200)
      }
    )
  })

  describe('Invalid secret rotation', () => {
    it(
      'should return 404 when clientId is not found' +
        ' @allure.label.tag:DWTA-445',
      async () => {
        const clientId = 'unknownclientid123'
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.rotateClientSecret(
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
        ' @allure.label.tag:DWTA-445',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.rotateClientSecret(
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
  })
})
