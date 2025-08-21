import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

describe('POPs Indicator Validation', () => {
  let wasteReceiptData

  beforeEach(() => {
    wasteReceiptData = generateBaseWasteReceiptData()
  })

  describe('Valid POPs Indicators', () => {
    it('should accept waste containing POPs with valid data', async () => {
      wasteReceiptData.waste[0].pops = {
        containsPops: true,
        pops: [
          {
            name: 'Aldrin',
            concentration: 50
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('globalMovementId')
    })

    it('should accept waste not containing POPs', async () => {
      wasteReceiptData.waste[0].pops = {
        containsPops: false
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('globalMovementId')
    })
  })

  describe('Invalid POPs Indicators', () => {
    it('should reject waste with missing POPs indicator', async () => {
      wasteReceiptData.waste[0].pops = {
        pops: [
          {
            name: 'Aldrin',
            concentration: 50
          }
        ]
      }
      // Note: containsPops field is intentionally omitted to test required validation

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.data.validation.errors).toEqual([
        {
          key: 'waste.0.pops.containsPops',
          errorType: 'NotProvided',
          message:
            'Does the waste contain persistent organic pollutants (POPs)? is required'
        }
      ])
    })

    it('should reject waste with just POPs list but no indicator', async () => {
      wasteReceiptData.waste[0].pops = {
        pops: [
          {
            name: 'Aldrin',
            concentration: 50
          }
        ]
      }
      // Note: containsPops field is intentionally omitted to test required validation

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.data.validation.errors).toEqual([
        {
          key: 'waste.0.pops.containsPops',
          errorType: 'NotProvided',
          message:
            'Does the waste contain persistent organic pollutants (POPs)? is required'
        }
      ])
    })
  })
})
