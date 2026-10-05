import { expect } from '@jest/globals'
import { beta2 } from '../test-data-manager.js'

/**
 * Asserts that POST /beta-2/movements created a movement.
 * @param {Object} response - API response
 */
export function expectMovementCreated(response) {
  expect(response.statusCode).toBe(201)
  expect(response.json).toEqual({
    data: {
      movementId: expect.any(String)
    },
    validation: {
      warnings: []
    }
  })
}

/**
 * Asserts that POST /beta-2/movements rejected the payload.
 * The error list is not checked while the validation messages are still changing.
 * @param {Object} response - API response
 */
export function expectMovementRejected(response) {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    detail: expect.stringMatching(/^\d+ validation errors? occurred$/),
    instance: '/beta-2/movements',
    requestId: response.headers['x-request-id'],
    errors: expect.any(Array)
  })
}
