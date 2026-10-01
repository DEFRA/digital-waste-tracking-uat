import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 API Code', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Unrecognised API Code', () => {
    it(
      'should reject creating a movement when the API code is not recognised' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const movementData = beta1.generateBaseMovementData()
        movementData.apiCode = randomUUID()

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: 'the API Code supplied is invalid',
          instance: '/beta-1/movements',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a collection when the API code is not recognised' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createMovement(
            beta1.generateBaseMovementData()
          )
        expect(createResponse.statusCode).toBe(201)
        const movementId = createResponse.json.data.movementId
        const collectionData = beta1.generateBaseCollectionData()
        collectionData.apiCode = randomUUID()

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createCollection(
            movementId,
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
          detail: 'the API Code supplied is invalid',
          instance: `/beta-1/movements/${movementId}/collection`,
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a delivery when the API code is not recognised' +
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

        const deliveryData = beta1.generateBaseDeliveryData([movementId])
        deliveryData.apiCode = randomUUID()

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            deliveryData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: 'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
          title: 'Bad Request',
          detail: 'the API Code supplied is invalid',
          instance: '/beta-1/deliveries',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt against a delivery when the API code is not recognised' +
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

        const deliveryResponse =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
            beta1.generateBaseDeliveryData([movementId])
          )
        expect(deliveryResponse.statusCode).toBe(201)
        const deliveryId = deliveryResponse.json.data.deliveries[0].deliveryId

        const receiptData = beta1.generateBaseReceiptData()
        receiptData.apiCode = randomUUID()

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta1.createReceiptWithDeliveryId(
            deliveryId,
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
          detail: 'the API Code supplied is invalid',
          instance: `/beta-1/deliveries/${deliveryId}/receipt`,
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject recording a receipt without a delivery ID when the API code is not recognised' +
        ' @allure.label.tag:DWTC-183',
      async () => {
        await addAllureLink('/DWTC-183', 'DWTC-183', 'jira')

        const receiptData = beta1.generateBaseReceiptWithoutDeliveryIdData()
        receiptData.apiCode = randomUUID()

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
          detail: 'the API Code supplied is invalid',
          instance: '/beta-1/receipts',
          requestId: response.headers['x-request-id']
        })
      }
    )
  })
})
