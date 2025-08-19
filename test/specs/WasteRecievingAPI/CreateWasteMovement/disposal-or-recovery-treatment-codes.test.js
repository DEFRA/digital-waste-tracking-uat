import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

describe('Disposal or Recovery Treatment Codes Validation', () => {
  let wasteReceiptData

  beforeEach(() => {
    wasteReceiptData = generateBaseWasteReceiptData()
    wasteReceiptData.receipt.disposalOrRecoveryCodes = []
  })

  describe('Valid Treatment Codes', () => {
    it('should accept valid disposal or recovery treatment codes with quantity', async () => {
      wasteReceiptData.receipt.disposalOrRecoveryCodes.push({
        code: 'R1',
        quantity: {
          metric: 'Tonnes',
          amount: 2.5,
          isEstimate: false
        }
      })

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('globalMovementId')
    })

    it('should accept multiple valid treatment codes', async () => {
      wasteReceiptData.receipt.disposalOrRecoveryCodes.push(
        {
          code: 'R1',
          quantity: {
            metric: 'Tonnes',
            amount: 1.5,
            isEstimate: false
          }
        },
        {
          code: 'D1',
          quantity: {
            metric: 'Tonnes',
            amount: 1.0,
            isEstimate: false
          }
        }
      )

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('globalMovementId')
    })
  })

  describe('Invalid Treatment Codes', () => {
    it('should reject unrecognized disposal or recovery treatment codes', async () => {
      wasteReceiptData.receipt.disposalOrRecoveryCodes = [
        {
          code: 'INVALID',
          quantity: {
            metric: 'Tonnes',
            amount: 2.5,
            isEstimate: false
          }
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.data.validation.errors).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes.0.code',
          errorType: 'UnexpectedError',
          message:
            '"receipt.disposalOrRecoveryCodes[0].code" must be one of [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15]'
        }
      ])
    })

    it('should reject treatment codes without quantity', async () => {
      wasteReceiptData.receipt.disposalOrRecoveryCodes = [
        {
          code: 'R1'
          // Missing quantity field
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.data.validation.errors).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes.0.quantity',
          errorType: 'NotProvided',
          message: '"Quantity" is required'
        }
      ])
    })
  })

  describe('Missing Treatment Codes', () => {
    it('should accept request without disposal or recovery treatment codes but with warnings', async () => {
      delete wasteReceiptData.receipt.disposalOrRecoveryCodes

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.data.validation.warnings).toEqual([
        {
          key: 'receipt.disposalOrRecoveryCodes',
          errorType: 'NotProvided',
          message:
            'Disposal or Recovery codes are required for proper waste tracking and compliance'
        }
      ])
    })
  })
})
