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
      expect(response.json).toEqual({
        type: 'https://waste-tracking.service.gov.uk/problems/not-found',
        title: 'Not Found',
        detail: `No delivery exists with delivery ID: ${beta1.unknownResourceId}`,
        instance: `/beta-1/deliveries/${beta1.unknownResourceId}/receipt`
      })
    })
  })
})
