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

  if (createResponse.statusCode !== 201) {
    throw new Error(
      `Failed to create waste movement: status ${createResponse.statusCode}`
    )
  }

  const wasteTrackingId = createResponse.json?.wasteTrackingId
  if (wasteTrackingId == null) {
    throw new Error(
      'Failed to create waste movement: response did not include wasteTrackingId'
    )
  }

  return wasteTrackingId
}
