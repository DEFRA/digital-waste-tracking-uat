import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 Collection Creation', () => {
  let collectionData

  beforeEach(async () => {
    collectionData = beta1.generateBaseCollectionData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it(
      'should successfully record a collection against an existing movement' +
        ' @allure.label.tag:DWTC-118',
      async () => {
        await addAllureLink('/DWTC-118', 'DWTC-118', 'jira')

        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            beta1.generateBaseMovementData()
          )
        expect(createResponse.statusCode).toBe(201)
        const movementId = createResponse.json.data.movementId

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            movementId,
            collectionData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          data: null,
          validation: {
            warnings: []
          }
        })
      }
    )
  })

  describe('Unknown Movement', () => {
    it('should reject recording a collection when the movement does not exist', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
          beta1.unknownResourceId,
          collectionData
        )

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toContain(
        'application/problem+json'
      )
      expect(response.headers['x-request-id']).toEqual(expect.any(String))
      expect(response.json).toEqual({
        type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/not-found',
        title: 'Not Found',
        detail: 'movementId not found',
        instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`,
        requestId: response.headers['x-request-id']
      })
    })
  })

  describe('Problem Responses', () => {
    it(
      'should reject recording a collection when an unexpected field is supplied' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        collectionData.orgName = 'not-allowed'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            beta1.unknownResourceId,
            collectionData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '1 validation error occurred',
          instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: 'must NOT have additional properties',
              pointer: '/orgName',
              errorType: 'NotAllowed'
            }
          ]
        })
      }
    )

    it(
      'should reject recording a collection when apiCode is not a UUID' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        collectionData.apiCode = 'not-a-uuid'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            beta1.unknownResourceId,
            collectionData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '1 validation error occurred',
          instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: 'must match format "uuid"',
              pointer: '/apiCode',
              errorType: 'InvalidFormat'
            }
          ]
        })
      }
    )

    it(
      'should reject recording a collection when the body is not valid JSON' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          '{',
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: 'Invalid request payload JSON format',
          instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a collection when the content type is XML' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          '<collection/>',
          {
            'Content-Type': 'application/xml',
            'x-cdp-request-id': randomUUID()
          }
        )

        expect(response.statusCode).toBe(415)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/unsupported-media-type',
          title: 'Unsupported Media Type',
          detail: 'Unsupported Media Type',
          instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a collection when the body is larger than 1 MB' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          'x'.repeat(1048577),
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        expect(response.statusCode).toBe(413)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/request-entity-too-large',
          title: 'Request Entity Too Large',
          detail:
            'Payload content length greater than maximum allowed: 1048576',
          instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`,
          requestId: response.headers['x-request-id']
        })
      }
    )
  })
})
