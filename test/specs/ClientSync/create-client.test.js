import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { ensureClientExistsAfterSync } from '~/test/support/helpers/client-sync.js'
import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'

describe('Create a client in DWT Client Sync Service', () => {
  let createdClientId

  beforeEach(async () => {
    await addAllureLink('/DWTA-443', 'DWTA-443', 'jira')
    createdClientId = undefined
  })

  afterEach(async () => {
    if (createdClientId) {
      await globalThis.apis.wasteMovementClientSyncAPI.deleteClient(
        createdClientId
      )
    }
  })

  describe('Valid client creation', () => {
    it(
      'should create a client, return credentials and persist it in both mongo and cognito' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const clientName = `UAT_Create_${Date.now()}`
        const {
          statusCode,
          json: created,
          headers
        } = await globalThis.apis.wasteMovementClientSyncAPI.createClient(
          clientName
        )

        expect(statusCode).toBe(200)
        expect(created).toEqual({
          clientName,
          clientId: expect.any(String),
          clientSecret: expect.any(String)
        })
        expect(headers['cache-control']).toBe('no-store')
        createdClientId = created.clientId

        const expectedClient = {
          clientName,
          clientId: createdClientId,
          tenantServiceName: DEFAULT_TENANT_SERVICE_NAME
        }

        const { statusCode: getStatusBeforeSync, json: clientBeforeSync } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(getStatusBeforeSync).toBe(200)
        expect(clientBeforeSync).toEqual(expectedClient)

        const clientAfterSync =
          await ensureClientExistsAfterSync(createdClientId)
        expect(clientAfterSync).toEqual(expectedClient)
      }
    )

    it(
      'should create a client and authenticate successfully with the returned credentials' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const { statusCode, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_Auth_${Date.now()}`
          )

        expect(statusCode).toBe(200)
        createdClientId = created.clientId

        const { statusCode: authStatus } =
          await globalThis.apis.cognitoOAuthApi.authenticate(
            created.clientId,
            created.clientSecret
          )
        expect(authStatus).toBe(200)
      }
    )
  })

  describe('Invalid client creation', () => {
    it(
      'should return 400 when clientName has invalid characters' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            'bad name with spaces'
          )

        expect(statusCode).toBe(400)
        expect(json).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: 'clientName must fit the regex pattern ^[\\w.-]+$',
          validation: {
            source: 'payload',
            keys: ['clientName']
          }
        })
      }
    )

    it(
      'should return 400 when clientName is missing' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            undefined
          )

        expect(statusCode).toBe(400)
        expect(json.statusCode).toBe(400)
        expect(json.error).toBe('Bad Request')
        expect(json.message).toBe('"clientName" is required')
      }
    )

    it(
      'should return 400 when clientName is longer than 128 characters' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            'x'.repeat(129)
          )

        expect(statusCode).toBe(400)
        expect(json).toEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: 'clientName must be 128 characters or fewer',
          validation: {
            source: 'payload',
            keys: ['clientName']
          }
        })
      }
    )

    it(
      'should return 404 when tenantServiceName is missing from the url path' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_MissingTenant_${Date.now()}`,
            ''
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
      'should return 404 when tenantServiceName is unknown' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const unknownTenantServiceName = `unknown-tenant-${Date.now()}`
        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            `UAT_UnknownTenant`,
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

    it(
      'should return 409 when clientName already exists case-insensitively' +
        ' @allure.label.tag:DWTA-443',
      async () => {
        const clientName = `UAT_Dup_${Date.now()}`
        const { statusCode: createStatus, json: created } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            clientName
          )

        expect(createStatus).toBe(200)
        createdClientId = created.clientId

        const { statusCode: getStatus } =
          await globalThis.apis.wasteMovementClientSyncAPI.getClient(
            createdClientId
          )
        expect(getStatus).toBe(200)

        const { statusCode, json } =
          await globalThis.apis.wasteMovementClientSyncAPI.createClient(
            clientName.toLowerCase()
          )

        expect(statusCode).toBe(409)
        expect(json).toEqual({
          statusCode: 409,
          error: 'Conflict',
          message: `Client name '${clientName.toLowerCase()}' already exists (case insensitive)`
        })
      }
    )
  })
})
