import { expect } from '@jest/globals'

/**
 * Submits phase 1 and phase 2 create-receipt payloads.
 * @param {Object} phase1Receipt - Phase 1 POST /movements/receive body
 * @param {Object} phase2Receipt - Phase 2 POST /beta-2/receipts body
 * @returns {Promise<void>}
 */
export async function expectBothReceiptsAccepted(phase1Receipt, phase2Receipt) {
  const phase1Response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      phase1Receipt
    )

  expect(phase1Response.statusCode).toBe(201)

  const phase2Response =
    await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
      phase2Receipt
    )

  expect(phase2Response.statusCode).toBe(201)
}

/**
 * Submits both payloads and expects both phases to reject them.
 * @param {Object} phase1Receipt - Phase 1 POST /movements/receive body
 * @param {Object} phase2Receipt - Phase 2 POST /beta-2/receipts body
 * @returns {Promise<void>}
 */
export async function expectBothReceiptsRejected(phase1Receipt, phase2Receipt) {
  const phase1Response =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      phase1Receipt
    )

  expect(phase1Response.statusCode).toBe(400)

  const phase2Response =
    await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
      phase2Receipt
    )

  expect(phase2Response.statusCode).toBe(400)
}
