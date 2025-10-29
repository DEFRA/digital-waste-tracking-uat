import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

describe('Authentication for Waste Movement Receipt Submissions', () => {
  let wasteReceiptData

  beforeEach(() => {
    wasteReceiptData = generateBaseWasteReceiptData()
  })

  describe('Valid Authentication', () => {
    it('should accept waste movement receipt with valid authentication', async () => {
      // Get a valid authentication token from Cognito OAuth
      const authResponse = await globalThis.apis.cognitoOAuthApi.authenticate(
        globalThis.testConfig.cognitoClientId,
        globalThis.testConfig.cognitoClientSecret
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

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
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

    it('should return unauthorized error when reference data is requested with expired authentication header', async () => {
      // token expired on Mon Oct 06 2025 15:34:27 GMT+0100
      const expiredToken =
        'eyJraWQiOiJQYnJiZXZvYUF5d1NQcG5KUWlsQXVCT1Q4aVdyNUFcL3RaQkZHaTk5TU5CTT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIybHRldXNlaHNxOXZuZTdkcDFoM3ZtdGUwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJ3YXN0ZS1tb3ZlbWVudC1leHRlcm5hbC1hcGktcmVzb3VyY2Utc3J2XC9hY2Nlc3MiLCJhdXRoX3RpbWUiOjE3NTk3NTc2NjcsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTIuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0yX3l4VzliZUpDVyIsImV4cCI6MTc1OTc2MTI2NywiaWF0IjoxNzU5NzU3NjY3LCJ2ZXJzaW9uIjoyLCJqdGkiOiI4YjRlZDA0Yi1mNjdmLTRiODUtOTBlMC1lNWEyZTZmZjc4YmIiLCJjbGllbnRfaWQiOiIybHRldXNlaHNxOXZuZTdkcDFoM3ZtdGUwIn0.qK737wPhWaF-vRQ2cbWf3MZBOmarmEyvTY4csyL4flewPDemc3VJv7X5n2s6p0wz0cldJHcU-F4iLIXwnJ1jcLgMWsYwQiU2HtDNq0WAaL2O0y4z3cCX3urZy281kuRjr0VFvLJRplDbKVEkuiv5nGhVU9UOUCRaLAPqXc9T1oGglh-lG1gCh_XKbAxMKv0XRf8sIY9DrNzGlT5yUrpedrWWksAqG5ZJpj20eDlhJejOSvHnSTggpn43IDXvX09jplrnrbrArYdlP7WnVhtTBcGppcbX8Z8yLVHlHnYv-tDJPtKQfPRltXxAzyR6uL1kQfMBna6hU1kmHVto2AYGVw'
      globalThis.apis.wasteMovementExternalAPI.setAuthToken(expiredToken)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
          'ewc-codes'
        )
      expect(response.statusCode).toBe(401)
    })
  })
})
