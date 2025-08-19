// import { describe, it, expect, beforeEach } from '@jest/globals'
// import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'

// describe('Hazardous Component Concentration Validation', () => {
//   let wasteReceiptData

//   beforeEach(() => {
//     wasteReceiptData = generateBaseWasteReceiptData()
//   })

//   describe('Valid Numerical Concentrations', () => {
//     it.each([[12.5], [500], [0]])(
//       'should accept concentration value of %f mg/kg',
//       async (concentrationValue) => {
//         wasteReceiptData.waste[0].hazardousProperties = {
//           containsHazardousProperties: true,
//           components: [
//             {
//               name: 'Test Chemical',
//               concentration: concentrationValue
//             }
//           ]
//         }

//         const response =
//           await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//             wasteReceiptData
//           )

//         expect(response.statusCode).toBe(200)
//         expect(response.data).toHaveProperty('globalMovementId')
//       }
//     )

//     it('should accept "Not Supplied" concentration value', async () => {
//       wasteReceiptData.waste[0].hazardousProperties = {
//         containsHazardousProperties: true,
//         components: [
//           {
//             name: 'Test Chemical',
//             concentration: 'Not Supplied'
//           }
//         ]
//       }

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(200)
//       expect(response.data).toHaveProperty('globalMovementId')
//     })

//     it('should accept blank concentration value with warning', async () => {
//       wasteReceiptData.waste[0].hazardousProperties = {
//         containsHazardousProperties: true,
//         components: [
//           {
//             name: 'Test Chemical'
//             // Missing concentration field
//           }
//         ]
//       }

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(200)
//       expect(response.data).toHaveProperty('globalMovementId')
//       // Note: This test assumes the API returns a warning about required concentration
//     })
//   })

//   describe('Non-Hazardous Waste', () => {
//     it('should accept non-hazardous waste without concentration', async () => {
//       wasteReceiptData.waste[0].hazardousProperties = {
//         containsHazardousProperties: false
//         // No components field for non-hazardous waste
//       }

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(200)
//       expect(response.data).toHaveProperty('globalMovementId')
//     })

//     it('should reject non-hazardous waste with concentration', async () => {
//       wasteReceiptData.waste[0].hazardousProperties = {
//         containsHazardousProperties: false,
//         components: [
//           {
//             name: 'Test Chemical',
//             concentration: 50
//           }
//         ]
//       }

//       const response =
//         await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
//           wasteReceiptData
//         )

//       expect(response.statusCode).toBe(400)
//       // Note: This test assumes the API returns an error about concentration not being allowed for non-hazardous waste
//     })
//   })
// })
