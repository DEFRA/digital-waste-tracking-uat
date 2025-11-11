import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('POPs Indicator Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid POPs Indicators', () => {
    it('should accept waste containing POPs', async () => {
      wasteReceiptData.wasteItems[0].containsPops = true
      wasteReceiptData.wasteItems[0].pops = {
        sourceOfComponents: 'NOT_PROVIDED'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it('should accept waste containing POPs in multiple waste items', async () => {
      wasteReceiptData.wasteItems[0].containsPops = true
      wasteReceiptData.wasteItems[0].pops = {
        sourceOfComponents: 'CARRIER_PROVIDED',
        components: [
          {
            code: 'ALD',
            concentration: 5.5
          }
        ]
      }

      wasteReceiptData.wasteItems.push({ ...wasteReceiptData.wasteItems[0] })
      wasteReceiptData.wasteItems[1].containsPops = true
      wasteReceiptData.wasteItems[1].pops = {
        sourceOfComponents: 'CARRIER_PROVIDED',
        components: [
          {
            code: 'CHL',
            concentration: 10.5
          }
        ]
      }

      wasteReceiptData.wasteItems.push({ ...wasteReceiptData.wasteItems[0] })
      wasteReceiptData.wasteItems[2].containsPops = false
      delete wasteReceiptData.wasteItems[2].pops

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })

    it(
      'should accept waste not containing POPs' +
        ' @allure.label.tag:DWT-346' +
        ' @allure.label.tag:DWT-353' +
        ' @allure.label.tag:bug-resolved:DWT-958',
      async () => {
        addAllureLink('/DWT-958', 'DWT-958', 'jira')
        wasteReceiptData.wasteItems[0].containsPops = false
        wasteReceiptData.wasteItems[0].pops = {}

        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )

        expect(response.statusCode).toBe(201)
        expect(response.json).toEqual({
          wasteTrackingId: expect.any(String)
        })
      }
    )
  })

  describe('Invalid POPs Indicators', () => {
    it('should reject waste with missing POPs indicator', async () => {
      wasteReceiptData.wasteItems[0].pops = {}
      // Note: containsPops field is intentionally omitted to test required validation
      delete wasteReceiptData.wasteItems[0].containsPops

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.containsPops',
              errorType: 'NotProvided',
              message: '"wasteItems[0].containsPops" is required'
            }
          ]
        }
      })
    })
  })
})
