import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

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
      expect(createResponse.statusCode).toBe(200)

      const globalMovementId = createResponse.json.globalMovementId

      // Update the movement with different disposal codes
      const updatedData = generateBaseWasteReceiptData()
      updatedData.receipt.disposalOrRecoveryCodes = [
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
          globalMovementId,
          updatedData
        )

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({
        message: 'Receipt movement updated successfully'
      })
    })

    it(
      'should successfully update hazardous components in an existing waste movement' +
        ' @allure.label.tag:DWT-351',
      async () => {
        await addAllureLink('/DWT-351', 'DWT-351', 'jira')
        // First create a movement
        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(createResponse.statusCode).toBe(200)

        const globalMovementId = createResponse.json.globalMovementId

        // Update the movement with different hazardous components
        const updatedData = generateBaseWasteReceiptData()
        wasteReceiptData.wasteItems[0].hazardous.components = [
          {
            name: 'benzene',
            concentration: 0.15
          }
        ]

        const updateResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
            globalMovementId,
            updatedData
          )

        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.json).toEqual({
          message: 'Receipt movement updated successfully'
        })
        // ??ToDo: validate to see if it appends to the existing array of components or replaces it entirely
      }
    )
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
})
