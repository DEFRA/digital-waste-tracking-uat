import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 Receipt Creation', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it(
      'should successfully record a receipt against an existing delivery' +
        ' @allure.label.tag:DWTC-140',
      async () => {
        await addAllureLink('/DWTC-140', 'DWTC-140', 'jira')

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

        const deliveryResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData([movementId])
          )
        expect(deliveryResponse.statusCode).toBe(201)
        const deliveryId = deliveryResponse.json.data.deliveries[0].deliveryId

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithDeliveryId(
            deliveryId,
            beta1.generateBaseReceiptData()
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          data: {
            deliveryId
          },
          validation: {
            warnings: []
          }
        })
      }
    )

    it(
      'should successfully record a receipt without a delivery ID when a reason is provided' +
        ' @allure.label.tag:DWTC-142',
      async () => {
        await addAllureLink('/DWTC-142', 'DWTC-142', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithoutDeliveryId(
            beta1.generateBaseReceiptWithoutDeliveryIdData()
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty(
          'data.deliveryId',
          expect.any(String)
        )
        expect(response.json.validation).toEqual({
          warnings: []
        })
      }
    )
  })

  describe('Unknown Delivery', () => {
    it('should reject recording a receipt when the delivery does not exist', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithDeliveryId(
          beta1.unknownResourceId,
          beta1.generateBaseReceiptData()
        )

      expect(response.statusCode).toBe(404)
      expect(response.headers['content-type']).toContain(
        'application/problem+json'
      )
      expect(response.headers['x-request-id']).toEqual(expect.any(String))
      expect(response.json).toEqual({
        type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/not-found',
        title: 'Not Found',
        detail: `No delivery exists with delivery ID: ${beta1.unknownResourceId}`,
        instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
        requestId: response.headers['x-request-id']
      })
    })
  })

  describe('Problem Responses', () => {
    it(
      'should reject recording a receipt without a delivery ID when reason is empty' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptWithoutDeliveryIdData()
        receiptData.reason = ''

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithoutDeliveryId(
            receiptData
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
          instance: '/beta-1/receipts',
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: 'must NOT have fewer than 1 characters',
              pointer: '/reason',
              errorType: 'OutOfRange'
            }
          ]
        })
      }
    )

    it(
      'should reject recording a receipt without a delivery ID when apiCode is missing' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptWithoutDeliveryIdData()
        delete receiptData.apiCode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithoutDeliveryId(
            receiptData
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
          instance: '/beta-1/receipts',
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
      'should reject recording a receipt without a delivery ID when reason is missing' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptWithoutDeliveryIdData()
        delete receiptData.reason

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithoutDeliveryId(
            receiptData
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
          instance: '/beta-1/receipts',
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: '"reason" is required',
              pointer: '/reason',
              errorType: 'NotProvided'
            }
          ]
        })
      }
    )

    it(
      'should reject recording a receipt without a delivery ID when an unexpected field is supplied' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptWithoutDeliveryIdData()
        receiptData.orgName = 'not-allowed'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithoutDeliveryId(
            receiptData
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
          instance: '/beta-1/receipts',
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
      'should reject recording a receipt without a delivery ID when apiCode is not a UUID' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptWithoutDeliveryIdData()
        receiptData.apiCode = 'not-a-uuid'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithoutDeliveryId(
            receiptData
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
          instance: '/beta-1/receipts',
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
      'should reject recording a receipt against a delivery when apiCode is missing' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptData()
        delete receiptData.apiCode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithDeliveryId(
            beta1.unknownResourceId,
            receiptData
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
          instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
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
      'should reject recording a receipt against a delivery when an unexpected field is supplied' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptData()
        receiptData.orgName = 'not-allowed'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithDeliveryId(
            beta1.unknownResourceId,
            receiptData
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
          instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
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
      'should reject recording a receipt against a delivery when apiCode is not a UUID' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptData()
        receiptData.apiCode = 'not-a-uuid'

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithDeliveryId(
            beta1.unknownResourceId,
            receiptData
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
          instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
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
      'should reject recording a receipt without a delivery ID when the body is not valid JSON' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/receipts',
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
          instance: '/beta-1/receipts',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt against a delivery when the body is not valid JSON' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
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
          instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt without a delivery ID when the content type is XML' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/receipts',
          '<receipt/>',
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
          instance: '/beta-1/receipts',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt against a delivery when the content type is XML' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
          '<receipt/>',
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
          instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt without a delivery ID when the body is larger than 1 MB' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          '/beta-1/receipts',
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
          instance: '/beta-1/receipts',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt against a delivery when the body is larger than 1 MB' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const response = await globalThis.apis.wasteMovementExternalAPI.post(
          `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
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
          instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`,
          requestId: response.headers['x-request-id']
        })
      }
    )
  })
})
