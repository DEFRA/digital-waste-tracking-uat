import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Other References For Movement Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-329', 'DWT-329', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Other References Scenarios', () => {
    it('should accept waste movement with valid other references array containing multiple label-reference pairs @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: 'PO Number',
          reference: 'PO-12345'
        },
        {
          label: 'Waste Ticket',
          reference: 'WT-67890'
        },
        {
          label: 'Haulier Note',
          reference: 'HN-11111'
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(201)
      expect(response.json).toHaveProperty('wasteTrackingId')
    })

    it('should accept waste movement with single other reference pair @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: 'Purchase Order',
          reference: 'PO-98765'
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(201)
      expect(response.json).toHaveProperty('wasteTrackingId')
    })

    it('should accept waste movement with empty other references array @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = []

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(201)
      expect(response.json).toHaveProperty('wasteTrackingId')
    })

    it('should accept waste movement without other references field @allure.label.tag:DWT-329', async () => {
      // Don't set otherReferencesForMovement field at all
      delete wasteReceiptData.otherReferencesForMovement

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(201)
      expect(response.json).toHaveProperty('wasteTrackingId')
    })

    it('should reject waste movement with null other references @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = null

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement',
              errorType: 'InvalidType',
              message: '"otherReferencesForMovement" must be an array'
            }
          ]
        }
      })
    })
  })

  describe('Invalid Other References Scenarios', () => {
    it('should reject waste movement with incomplete reference pair - missing reference @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: 'PO Number'
          // Missing reference field
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.0.reference',
              errorType: 'NotProvided',
              message: '"otherReferencesForMovement[0].reference" is required'
            }
          ]
        }
      })
    })

    it('should reject waste movement with incomplete reference pair - missing label @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          reference: 'PO-12345'
          // Missing label field
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.0.label',
              errorType: 'NotProvided',
              message: '"otherReferencesForMovement[0].label" is required'
            }
          ]
        }
      })
    })

    it('should reject waste movement with empty label in reference pair @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: '',
          reference: 'PO-12345'
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.0.label',
              errorType: 'InvalidValue',
              message:
                '"otherReferencesForMovement[0].label" is not allowed to be empty'
            }
          ]
        }
      })
    })

    it('should reject waste movement with empty reference in reference pair @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: 'PO Number',
          reference: ''
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.0.reference',
              errorType: 'InvalidValue',
              message:
                '"otherReferencesForMovement[0].reference" is not allowed to be empty'
            }
          ]
        }
      })
    })

    it('should reject waste movement with null label in reference pair @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: null,
          reference: 'PO-12345'
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.0.label',
              errorType: 'InvalidType',
              message: '"otherReferencesForMovement[0].label" must be a string'
            }
          ]
        }
      })
    })

    it('should reject waste movement with null reference in reference pair @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: 'PO Number',
          reference: null
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.0.reference',
              errorType: 'InvalidType',
              message:
                '"otherReferencesForMovement[0].reference" must be a string'
            }
          ]
        }
      })
    })

    it('should reject waste movement with mixed valid and invalid reference pairs @allure.label.tag:DWT-329', async () => {
      wasteReceiptData.otherReferencesForMovement = [
        {
          label: 'PO Number',
          reference: 'PO-12345'
        },
        {
          label: 'Waste Ticket'
          // Missing reference
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'otherReferencesForMovement.1.reference',
              errorType: 'NotProvided',
              message: '"otherReferencesForMovement[1].reference" is required'
            }
          ]
        }
      })
    })
  })
})
