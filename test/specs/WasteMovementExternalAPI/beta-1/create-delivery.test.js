import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 Delivery Creation', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret,
      { retry: true }
    )
  })

  describe('Delivery Created Successfully', () => {
    it(
      'should successfully record a delivery for a collected movement and return a delivery ID' +
        ' @allure.label.tag:DWTC-119',
      async () => {
        await addAllureLink('/DWTC-119', 'DWTC-119', 'jira')

        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            beta1.generateBaseMovementData()
          )
        expect(createResponse.statusCode).toBe(201)
        const movementId = createResponse.json.data.movementId

        const collectionResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            movementId,
            beta1.generateBaseCollectionData()
          )
        expect(collectionResponse.statusCode).toBe(201)

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData([movementId])
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          data: {
            deliveries: [
              {
                deliveryId: expect.any(String),
                movementIds: [movementId],
                wasteType: 'NON_HAZARDOUS'
              }
            ]
          },
          validation: {
            warnings: []
          }
        })
      }
    )

    it(
      'should successfully record a delivery for multiple collected movements and return delivery IDs' +
        ' @allure.label.tag:DWTC-119' +
        ' @allure.label.tag:DWTC-188',
      async () => {
        await addAllureLink('/DWTC-119', 'DWTC-119', 'jira')
        await addAllureLink('/DWTC-188', 'DWTC-188', 'jira')

        const firstCreateResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            beta1.generateBaseMovementData()
          )
        expect(firstCreateResponse.statusCode).toBe(201)
        const firstMovementId = firstCreateResponse.json.data.movementId

        const secondCreateResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            beta1.generateBaseMovementData()
          )
        expect(secondCreateResponse.statusCode).toBe(201)
        const secondMovementId = secondCreateResponse.json.data.movementId

        const firstCollectionResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            firstMovementId,
            beta1.generateBaseCollectionData()
          )
        expect(firstCollectionResponse.statusCode).toBe(201)

        const secondCollectionResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            secondMovementId,
            beta1.generateBaseCollectionData()
          )
        expect(secondCollectionResponse.statusCode).toBe(201)

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData([firstMovementId, secondMovementId])
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          data: {
            deliveries: [
              {
                deliveryId: expect.any(String),
                movementIds: [firstMovementId, secondMovementId],
                wasteType: 'NON_HAZARDOUS'
              }
            ]
          },
          validation: {
            warnings: []
          }
        })
      }
    )
  })

  describe('Delivery Not Created', () => {
    it(
      'should reject recording a delivery when the movement IDs do not exist' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData(['00NOTFND'])
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: 'No movement exists for movement ID(s): 00NOTFND',
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a delivery when one movement exists and another does not' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            beta1.generateBaseMovementData()
          )
        expect(createResponse.statusCode).toBe(201)
        const movementId = createResponse.json.data.movementId

        const collectionResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            movementId,
            beta1.generateBaseCollectionData()
          )
        expect(collectionResponse.statusCode).toBe(201)

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData([movementId, '00NOTFND'])
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: 'No movement exists for movement ID(s): 00NOTFND',
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a delivery when apiCode and movementIds are not provided' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            {}
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toBeDefined()
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: '2 validation errors occurred',
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id'],
          errors: expect.arrayContaining([
            {
              message: '"apiCode" is required',
              pointer: '/apiCode',
              errorType: 'NotProvided'
            },
            {
              message: '"movementIds" is required',
              pointer: '/movementIds',
              errorType: 'NotProvided'
            }
          ])
        })
        expect(response.json.errors).toHaveLength(2)
      }
    )

    it(
      'should reject recording a delivery when apiCode is missing' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const deliveryData = beta1.generateBaseDeliveryData([
          beta1.unknownResourceId
        ])
        delete deliveryData.apiCode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            deliveryData
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
          instance: '/beta-1/deliveries',
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
      'should reject recording a delivery when movementIds is missing' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const deliveryData = beta1.generateBaseDeliveryData([
          beta1.unknownResourceId
        ])
        delete deliveryData.movementIds

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            deliveryData
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
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: '"movementIds" is required',
              pointer: '/movementIds',
              errorType: 'NotProvided'
            }
          ]
        })
      }
    )

    it(
      'should reject recording a delivery when movementIds is empty' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData([])
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
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: 'must NOT have fewer than 1 items',
              pointer: '/movementIds',
              errorType: 'OutOfRange'
            }
          ]
        })
      }
    )

    it(
      'should reject recording a delivery when an unexpected field is supplied' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const deliveryData = beta1.generateBaseDeliveryData([
          beta1.unknownResourceId
        ])
        deliveryData.orgName = 'not-allowed'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            deliveryData
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
          instance: '/beta-1/deliveries',
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
      'should reject recording a delivery when apiCode is not a UUID' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const deliveryData = beta1.generateBaseDeliveryData(['xxxx', 'yyyy'])
        deliveryData.apiCode = 'not-a-uuid'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            deliveryData
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
          instance: '/beta-1/deliveries',
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
      'should reject recording a delivery when the body is not valid JSON' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/deliveries',
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
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a delivery when the content type is XML' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/deliveries',
          '<delivery/>',
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
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a delivery when the body is larger than 1 MB' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/deliveries',
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
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id']
        })
      }
    )
  })
})
