import { expect } from '@jest/globals'

/**
 * Creates a waste movement via the external API and returns its waste tracking id.
 * @param {Object} wasteReceiptData - Receipt payload for POST /movements/receive
 * @returns {Promise<string>} The waste tracking id
 */
export async function createMovementAndGetWasteTrackingId(wasteReceiptData) {
  const createResponse =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      wasteReceiptData
    )

  expect(createResponse.statusCode).toBe(201)
  expect(createResponse.json).toHaveProperty(
    'wasteTrackingId',
    expect.any(String)
  )

  return createResponse.json.wasteTrackingId
}
