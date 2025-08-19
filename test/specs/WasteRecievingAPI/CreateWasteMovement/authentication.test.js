// import { describe, it, expect, beforeEach } from '@jest/globals'
// import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

// describe('Authentication for Waste Movement Receipt Submissions', () => {
//   let wasteReceiptData

//   beforeEach(() => {
//     wasteReceiptData = generateBaseWasteReceiptData()
//   })

//   describe('Valid Authentication', () => {
//     it('should accept waste movement receipt with valid authentication', async () => {
//       // Get a valid authentication token from Cognito OAuth
//       const authResponse = await globalThis.apis.cognitoOAuthApi.authenticate(
//         global.testConfig.cognitoClientId,
//         global.testConfig.cognitoClientSecret
//       )

//       expect(authResponse.statusCode).toBe(200)
//       expect(authResponse.data).toHaveProperty('access_token')

//       // Set the valid authentication token
//       globalThis.apis.wasteMovementExternalAPI.setAuthToken(
//         authResponse.data.access_token
//       )

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(200)
//       expect(response.data).toHaveProperty('globalMovementId')
//     })
//   })

//   describe('Invalid Authentication', () => {
//     it('should reject waste movement receipt with an invalid authentication header', async () => {
//       // Set an invalid authentication token
//       globalThis.apis.wasteMovementExternalAPI.setAuthToken(
//         'invalid-token-12345'
//       )

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       // Note: This test expects the API to return 401 for invalid authentication
//       expect(response.statusCode).toBe(401)
//     })

//     it('should reject waste movement receipt with an expired authentication header', async () => {
//       // Set an expired authentication token (assuming the API can detect expired tokens)
//       globalThis.apis.wasteMovementExternalAPI.setAuthToken(
//         'how do we get an expired token?'
//       )

//     // 19/08/25
//     // dev: eyJraWQiOiJQYnJiZXZvYUF5d1NQcG5KUWlsQXVCT1Q4aVdyNUFcL3RaQkZHaTk5TU5CTT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIybHRldXNlaHNxOXZuZTdkcDFoM3ZtdGUwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJ3YXN0ZS1tb3ZlbWVudC1leHRlcm5hbC1hcGktcmVzb3VyY2Utc3J2XC9hY2Nlc3MiLCJhdXRoX3RpbWUiOjE3NTU2MTYzOTUsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTIuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0yX3l4VzliZUpDVyIsImV4cCI6MTc1NTYxOTk5NSwiaWF0IjoxNzU1NjE2Mzk1LCJ2ZXJzaW9uIjoyLCJqdGkiOiIzMzc2MjAyNC01NGM0LTQyNTYtOWNlNS03NTRjZDJjZTk4ODciLCJjbGllbnRfaWQiOiIybHRldXNlaHNxOXZuZTdkcDFoM3ZtdGUwIn0.i6llLpZzZMN0lyyhy7a02wgCS5C6L1zDxqQSbwPEH9lF7_q7J-JwqeSHuS4KKA2nshCbTTv3IsOfhUnqat12XMzb-Px3Lrzq2v4U4lo4tT2oY6b5XoFf2jpK-Nnn7wEB5vEUXmzvVDaR8y7OhV47HHptMIBg0jQ20zo-VOw412K2h1hRZ5WhnXnU9711accHkILaMm3M26bbQnPR2pnkh1rHSG17wYvK2Fy09HZ3SWcrUAM9PUfwwLnbB36TzjQSZcz8QP0F6cL-8CNuhuiewlEEB7qNvyTKJjFdi-xgVWW5Dl3ssa39IRu_apr4bNllkGBMSosabvQxf9a29feyyw
//     // test: eyJraWQiOiJhSkozemlZbVwvOTJaalZrXC95bFRTa080TVwvWklcLzRPcEkrdFc0MXNWMEh6Zz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIyNTU1dmdubTZyajF1bGVkMHRrc3IwZmI1OCIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoid2FzdGUtbW92ZW1lbnQtZXh0ZXJuYWwtYXBpLXJlc291cmNlLXNydlwvYWNjZXNzIiwiYXV0aF90aW1lIjoxNzU1NjE2MzgxLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0yLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMl9HR3pyNG9kTzUiLCJleHAiOjE3NTU2MTk5ODEsImlhdCI6MTc1NTYxNjM4MSwidmVyc2lvbiI6MiwianRpIjoiMTkyNzYyMDQtNzA5Yi00MDU4LTg1ZGUtZTRiYjkwMzg2NWRkIiwiY2xpZW50X2lkIjoiMjU1NXZnbm02cmoxdWxlZDB0a3NyMGZiNTgifQ.kqlddA3tn7JbT-CMPcj7yFeakGvnB2DSJrZtQmnF8meze6oXpaUJWubDAGYZ3lQx5OyoOMJFHoOr_I5J3j6AE3i37eFrDGFkTtV_mqx_eA1u4jO7rbqxLJ4IasKXZ0CgWN5_535NdU5ADmcqAj4ulkD__L4St2o0pDYyez0xUX1MaUcbOvV71rnQWw_975WojZV3XagC4Gjogj2iXOWHR3OkAHcJ0BWo4IuHmyvwXevMNdEXkcJ_clyv2scQaOdnCkG4kp2jvkbhVkVlkQbu9RsBKTUqCh32-cpsruP7Mv0UPL5d5XgghCtPojc5E19e1CzWo1E_cjJu-_L82rGOfw
//     //   "expires_in": 3600, "token_type": "Bearer"

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       // Note: This test expects the API to return 401 for expired authentication
//       expect(response.statusCode).toBe(401)
//     })

//     it('should reject waste movement receipt with a missing authentication header', async () => {
//       // Remove the authentication token by setting it to undefined
//       globalThis.apis.wasteMovementExternalAPI.setAuthToken(undefined)

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       // Note: This test expects the API to return 401 for missing authentication
//       expect(response.statusCode).toBe(401)
//     })
//   })
// })
