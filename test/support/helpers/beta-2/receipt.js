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
 * Pass the errors array as the second argument for POST /beta-2/receipts.
 * Pass the delivery ID, then the errors array, for POST /beta-2/deliveries/{deliveryId}/receipt.
 * @param {Object} response - API response
 * @param {string|Array<{message: string, pointer: string, errorType: string}>} deliveryIdOrErrors - Delivery ID, or the expected errors when there is no delivery ID
 * @param {Array<{message: string, pointer: string, errorType: string}>} [errors] - Expected problem errors, in response order
 */
export function expectReceiptRejected(response, deliveryIdOrErrors, errors) {
  const deliveryId = Array.isArray(deliveryIdOrErrors)
    ? undefined
    : deliveryIdOrErrors
  const expectedErrors = Array.isArray(deliveryIdOrErrors)
    ? deliveryIdOrErrors
    : errors

  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    detail: validationErrorDetail(expectedErrors),
    instance: deliveryId
      ? `/beta-2/deliveries/${deliveryId}/receipt`
      : '/beta-2/receipts',
    requestId: response.headers['x-request-id'],
    errors: expectedErrors
  })
}

/**
 * @param {Array} errors
 * @returns {string}
 */
function validationErrorDetail(errors) {
  const count = errors.length
  return `${count} validation error${count === 1 ? '' : 's'} occurred`
}
