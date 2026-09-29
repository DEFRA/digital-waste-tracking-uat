import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 Movement Creation', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta1.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Movement Created Successfully', () => {
    it(
      'should successfully create a new movement with only required fields' +
        ' @allure.label.tag:DWTC-117',
      async () => {
        await addAllureLink('/DWTC-117', 'DWTC-117', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty(
          'data.movementId',
          expect.any(String)
        )
      }
    )
  })

  describe('Movement Not Created', () => {
    it(
      'should reject creating a movement when apiCode is missing' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        delete movementData.apiCode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '1 validation error occurred',
          instance: '/beta-1/movements',
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: '"apiCode" is required',
              pointer: '/apiCode',
              errorType: 'NotProvided'
            }
          ]
        })
      }
    )

    it(
      'should reject creating a movement when an unexpected field is supplied' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        movementData.orgName = 'not-allowed'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '1 validation error occurred',
          instance: '/beta-1/movements',
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
      'should reject creating a movement when apiCode is not a UUID' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        movementData.apiCode = 'not-a-uuid'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '1 validation error occurred',
          instance: '/beta-1/movements',
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
      'should reject creating a movement and report every schema failure' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement({
            orgName: 'not-allowed'
          })

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '2 validation errors occurred',
          instance: '/beta-1/movements',
          requestId: response.headers['x-request-id'],
          errors: expect.arrayContaining([
            {
              message: '"apiCode" is required',
              pointer: '/apiCode',
              errorType: 'NotProvided'
            },
            {
              message: 'must NOT have additional properties',
              pointer: '/orgName',
              errorType: 'NotAllowed'
            }
          ])
        })
        expect(response.json.errors).toHaveLength(2)
      }
    )

    it(
      'should reject creating a movement when the body is not valid JSON' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/movements',
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
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: 'Invalid request payload JSON format',
          instance: '/beta-1/movements',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject a request to an unknown beta-1 path' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.get(
          '/beta-1/does-not-exist'
        )

        expect(response.statusCode).toBe(404)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/not-found',
          title: 'Not Found',
          detail: 'Not Found',
          instance: '/beta-1/does-not-exist',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject creating a movement when the content type is XML' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/movements',
          '<movement/>',
          {
            'Content-Type': 'application/xml',
            'x-cdp-request-id': randomUUID()
          }
        )

        expect(response.statusCode).toBe(415)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/unsupported-media-type',
          title: 'Unsupported Media Type',
          detail: 'Unsupported Media Type',
          instance: '/beta-1/movements',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject creating a movement when the body is larger than 1 MB' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/movements',
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
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/request-entity-too-large',
          title: 'Request Entity Too Large',
          detail:
            'Payload content length greater than maximum allowed: 1048576',
          instance: '/beta-1/movements',
          requestId: response.headers['x-request-id']
        })
      }
    )
  })
})
