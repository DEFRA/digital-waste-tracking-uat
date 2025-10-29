/**
 * @allure.label.tag:DWT-547 @allure.label.tag:DWT-541
 */
import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Receipt Details Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-547', 'DWT-547', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Missing Receipt Details', () => {
    it('should reject waste movement when receipt details are missing', async () => {
      delete wasteReceiptData.receipt

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receipt',
              errorType: 'NotProvided',
              message: '"receipt" is required'
            }
          ]
        }
      })
    })
  })

  describe('Valid UK Postcode', () => {
    it('should accept waste movement when valid UK postcode is provided for receipt address', async () => {
      wasteReceiptData.receipt.address.postcode = 'BS1 4XE'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toHaveProperty('wasteTrackingId')
    })
  })

  describe('Invalid Postcode Format', () => {
    it('should reject waste movement when postcode contains invalid characters', async () => {
      wasteReceiptData.receipt.address.postcode = 'xxx'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receipt.address.postcode',
              errorType: 'UnexpectedError',
              message: '"receipt.address.postcode" must be in valid UK format'
            }
          ]
        }
      })
    })

    it('should reject waste movement when postcode contains no spaces', async () => {
      wasteReceiptData.receipt.address.postcode = 'BS14XE'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receipt.address.postcode',
              errorType: 'UnexpectedError',
              message: '"receipt.address.postcode" must be in valid UK format'
            }
          ]
        }
      })
    })

    it('should reject waste movement when Ireland postcode is provided', async () => {
      wasteReceiptData.receipt.address.postcode = 'D08 AC98'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'receipt.address.postcode',
              errorType: 'UnexpectedError',
              message: '"receipt.address.postcode" must be in valid UK format'
            }
          ]
        }
      })
    })
  })
})
