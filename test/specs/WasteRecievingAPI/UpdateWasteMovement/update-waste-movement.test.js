import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'

describe('Waste Movement Update', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Updates', () => {
    it('should successfully update an existing waste movement', async () => {
      // First create a movement
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)

      const wasteTrackingId = createResponse.json.wasteTrackingId

      // Update the movement with different disposal codes
      const updatedData = generateBaseWasteReceiptData()
      updatedData.wasteItems[0].disposalOrRecoveryCodes = [
        {
          code: 'D1',
          weight: {
            metric: 'Tonnes',
            amount: 3.0,
            isEstimate: false
          }
        }
      ]

      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          wasteTrackingId,
          updatedData
        )

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({})
    })
  })

  describe('Failed Updates', () => {
    it('should fail to update movement with non-existent ID', async () => {
      const nonExistentId = 'NONEXISTENT123'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          nonExistentId,
          wasteReceiptData
        )

      expect(response.statusCode).toBe(404)
    })
  })

  describe('Update is successful with warnings', () => {
    it('should update movement with warnings when missing disposal or recovery codes', async () => {
      // First create a movement
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)

      const wasteTrackingId = createResponse.json.wasteTrackingId

      // Update the movement with different disposal codes
      const updatedData = generateBaseWasteReceiptData()
      delete updatedData.wasteItems[0].disposalOrRecoveryCodes

      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          wasteTrackingId,
          updatedData
        )

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({
        validation: {
          warnings: [
            {
              key: 'wasteItems.0.disposalOrRecoveryCodes',
              errorType: 'NotProvided',
              message:
                'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
            }
          ]
        }
      })
    })
  })
})
