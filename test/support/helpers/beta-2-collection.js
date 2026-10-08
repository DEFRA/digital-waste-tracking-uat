import { expect } from '@jest/globals'
import { beta2 } from '../test-data-manager.js'

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
 */
export function expectCollectionRejected(response, movementId) {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    // TODO: Expect a 'detail' value once this is completed: https://eaflood.atlassian.net/browse/DWTC-221
    detail: expect.stringMatching(/^\d+ validation errors? occurred$/),
    instance: `/beta-2/movements/${movementId}/collection`,
    requestId: response.headers['x-request-id'],
    // TODO: Expect a specic set of 'errors' once this is completed: https://eaflood.atlassian.net/browse/DWTC-221
    errors: expect.any(Array)
  })
}
