import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta1 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-1 Delivery Creation', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
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

  describe('Unknown Movements', () => {
    it('should reject recording a delivery when the movement IDs do not exist', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta1.createDelivery(
          beta1.generateBaseDeliveryData([beta1.unknownResourceId])
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        type: 'https://waste-tracking.service.gov.uk/problems/bad-request',
        title: 'Bad Request',
        detail: `No movement exists for movement ID(s): ${beta1.unknownResourceId}`,
        instance: '/beta-1/deliveries'
      })
    })

    it('should reject recording a delivery when one movement exists and another does not', async () => {
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
          beta1.generateBaseDeliveryData([
            movementId,
            beta1.unknownResourceId
          ])
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        type: 'https://waste-tracking.service.gov.uk/problems/bad-request',
        title: 'Bad Request',
        detail: `No movement exists for movement ID(s): ${beta1.unknownResourceId}`,
        instance: '/beta-1/deliveries'
      })
    })
  })
})
