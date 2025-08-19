// import { describe, it, expect, beforeEach } from '@jest/globals'
// import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

// describe('Receiving Site ID Validation', () => {
//   let wasteReceiptData

//   beforeEach(() => {
//     wasteReceiptData = generateBaseWasteReceiptData()
//   })

//   describe('Valid Site IDs', () => {
//     it('should accept waste movement receipt for an owned site', async () => {
//       // Note: This test assumes the API validates site ownership
//       wasteReceiptData.receivingSiteId = '12345678-1234-1234-1234-123456789012'

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(200)
//       expect(response.data).toHaveProperty('globalMovementId')
//     })
//   })

//   describe('Invalid Site IDs', () => {
//     it('should reject waste movement receipt for an unowned site', async () => {
//       wasteReceiptData.receivingSiteId = '87654321-4321-4321-4321-210987654321'

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(400)
//       // Note: This test assumes the API returns an error about site ID not being valid for the account
//     })

//     it('should reject waste movement receipt for a non-existent site', async () => {
//       wasteReceiptData.receivingSiteId = 'non-existent-site-id'

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(400)
//       // Note: This test assumes the API returns an error about site ID not being valid
//     })

//     it('should reject waste movement receipt with missing site ID', async () => {
//       delete wasteReceiptData.receivingSiteId

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(400)
//       // Note: This test assumes the API returns an error about needing to specify a receiving site ID
//     })
//   })
// })
