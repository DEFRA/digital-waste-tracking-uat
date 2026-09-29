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
      expect(response.json).toEqual({
        type: 'https://waste-tracking.service.gov.uk/problems/not-found',
        title: 'Not Found',
        detail: 'movementId not found',
        instance: `/beta-1/movements/${beta1.unknownResourceId}/collection`
      })
    })
  })
})
