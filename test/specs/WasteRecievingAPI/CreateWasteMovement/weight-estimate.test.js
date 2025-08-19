// import { describe, it, expect, beforeEach } from '@jest/globals'
// import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

// describe('Waste Weight Estimate Validation', () => {
//   let wasteReceiptData

//   beforeEach(() => {
//     wasteReceiptData = generateBaseWasteReceiptData()
//   })

//   describe('Valid Weight Estimate Indicators', () => {
//     it.each([
//       [true, 'an estimate'],
//       [false, 'not an estimate']
//     ])(
//       'should accept weight estimate indicator: %s (%s)',
//       async (isEstimate, description) => {
//         wasteReceiptData.waste[0].quantity.isEstimate = isEstimate

//         const response =
//           await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//             wasteReceiptData
//           )

//         expect(response.statusCode).toBe(200)
//         expect(response.data).toHaveProperty('globalMovementId')
//       }
//     )
//   })

//   describe('Invalid Weight Estimate Indicators', () => {
//     it('should reject missing weight estimate indicator', async () => {
//       delete wasteReceiptData.waste[0].quantity.isEstimate

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(400)
//       // Note: This test assumes the API returns an error about required weight estimate indicator
//     })

//     it('should reject invalid weight estimate indicator', async () => {
//       wasteReceiptData.waste[0].quantity.isEstimate = 'invalid'

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(400)
//       // Note: This test assumes the API returns an error about weight estimate indicator must be true or false
//     })
//   })
// })
