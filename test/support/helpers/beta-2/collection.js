import { expect } from '@jest/globals'
import { beta2 } from '../../test-data-manager.js'

/**
 * Asserts that POST /beta-2/movements/{movementId}/collection recorded a collection.
 * @param {Object} response - API response
 */
export function expectCollectionCreated(response) {
  expect(response.statusCode).toBe(201)
  expect(response.json).toEqual({
    data: null,
    validation: {
      warnings: []
    }
  })
}

/**
 * Asserts that POST /beta-2/movements/{movementId}/collection rejected the payload.
 * @param {Object} response - API response
 * @param {string} movementId - Movement ID used in the request path
 * @param {Array<{message: string, pointer: string, errorType: string}>} errors - Expected problem errors, in response order
 */
export function expectCollectionRejected(response, movementId, errors) {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    detail: validationErrorDetail(errors),
    instance: `/beta-2/movements/${movementId}/collection`,
    requestId: response.headers['x-request-id'],
    errors
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
