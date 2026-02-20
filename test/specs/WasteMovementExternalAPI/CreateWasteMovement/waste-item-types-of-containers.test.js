import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Waste Item Container Types Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-333', 'DWT-333', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Container Types', () => {
    it('should accept waste movement with WBI container type @allure.label.tag:DWT-333', async () => {
      wasteReceiptData.wasteItems[0].typeOfContainers = 'WBI'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toHaveProperty('wasteTrackingId')
    })
  })

  describe('Invalid Container Types', () => {
    describe('Missing Container Type', () => {
      it('should reject waste movement when container type is not provided @allure.label.tag:DWT-333', async () => {
        delete wasteReceiptData.wasteItems[0].typeOfContainers
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.typeOfContainers',
                errorType: 'NotProvided',
                message: '"wasteItems[0].typeOfContainers" is required'
              }
            ]
          }
        })
      })
    })

    describe('Invalid Container Type Values', () => {
      it('should reject waste movement when container type is not an allowed value @allure.label.tag:DWT-333', async () => {
        wasteReceiptData.wasteItems[0].typeOfContainers = 'NotAllowed'
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'wasteItems.0.typeOfContainers',
                errorType: 'InvalidValue',
                message:
                  '"wasteItems[0].typeOfContainers" must be a valid container type'
              }
            ]
          }
        })
      })
    })
  })
})
