import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

describe.skip('Authentication for Waste Movement Receipt Submissions', () => {
  let wasteReceiptData

  beforeEach(() => {
    wasteReceiptData = generateBaseWasteReceiptData()
  })

  describe('Valid Authentication', () => {
    it('should accept waste movement receipt with valid authentication', async () => {
      // Get a valid authentication token from Cognito OAuth
      const authResponse = await globalThis.apis.cognitoOAuthApi.authenticate(
        global.testConfig.cognitoClientId,
        global.testConfig.cognitoClientSecret
      )

      expect(authResponse.statusCode).toBe(200)
      expect(authResponse.json).toHaveProperty('access_token')

      // Set the valid authentication token
      globalThis.apis.wasteMovementExternalAPI.setAuthToken(
        authResponse.json.access_token
      )

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toHaveProperty('globalMovementId')
    })
  })

  describe('Invalid Authentication', () => {
    it('should reject waste movement receipt with an invalid authentication header', async () => {
      // Set an invalid authentication token
      globalThis.apis.wasteMovementExternalAPI.setAuthToken(
        'invalid-token-12345'
      )

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // Note: This test expects the API to return 401 for invalid authentication
      expect(response.statusCode).toBe(401)
    })

    it('should reject waste movement receipt with an expired authentication header', async () => {
      // Set an expired authentication token (assuming the API can detect expired tokens)
      globalThis.apis.wasteMovementExternalAPI.setAuthToken(
        'how do we get an expired token?'
      )

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // Note: This test expects the API to return 401 for expired authentication
      expect(response.statusCode).toBe(401)
    })

    it('should reject waste movement receipt with a missing authentication header', async () => {
      // Remove the authentication token by setting it to undefined
      globalThis.apis.wasteMovementExternalAPI.setAuthToken(undefined)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      // Note: This test expects the API to return 401 for missing authentication
      expect(response.statusCode).toBe(401)
    })
  })
})
