import { expect } from '@jest/globals'
import { beta2 } from '../../test-data-manager.js'

/**
 * Asserts that a beta-2 receipt was recorded.
 * @param {Object} response - API response
 * @param {string} [deliveryId] - Expected delivery ID. When omitted, asserts any string (minted by POST /beta-2/receipts).
 */
export function expectReceiptCreated(response, deliveryId) {
  expect(response.statusCode).toBe(201)
  expect(response.json).toEqual({
    data: {
      deliveryId: deliveryId ?? expect.any(String)
    },
    validation: {
      warnings: []
    }
  })
}

/**
 * Asserts that a beta-2 receipt was rejected.
 * @param {Object} response - API response
 * @param {string} [deliveryId] - Delivery ID used in the request path. When omitted, asserts POST /beta-2/receipts.
 */
export function expectReceiptRejected(response, deliveryId) {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    // TODO: Expect a 'detail' value once this is completed: https://eaflood.atlassian.net/browse/DWTC-221
    detail: expect.stringMatching(/^\d+ validation errors? occurred$/),
    instance: deliveryId
      ? `/beta-2/deliveries/${deliveryId}/receipt`
      : '/beta-2/receipts',
    requestId: response.headers['x-request-id'],
    // TODO: Expect a specic set of 'errors' once this is completed: https://eaflood.atlassian.net/browse/DWTC-221
    errors: expect.any(Array)
  })
}
