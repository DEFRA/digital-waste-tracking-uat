import { expect } from '@jest/globals'
import { beta2 } from '../../test-data-manager.js'

/**
 * Asserts that POST /beta-2/deliveries recorded the given deliveries.
 * @param {Object} response - API response
 * @param {Object[]} deliveries - Expected deliveries (deliveryId, movementIds, wasteType)
 */
export function expectDeliveriesCreated(response, deliveries) {
  expect(response.statusCode).toBe(201)
  expect(response.json).toEqual({
    data: {
      deliveries
    },
    validation: {
      warnings: []
    }
  })
}

/**
 * Asserts that POST /beta-2/deliveries recorded a single non-hazardous delivery.
 * @param {Object} response - API response
 * @param {string[]} movementIds - Movement IDs submitted on the delivery
 */
export function expectDeliveryCreated(response, movementIds) {
  expectDeliveriesCreated(response, [
    {
      deliveryId: expect.any(String),
      movementIds,
      wasteType: 'NON_HAZARDOUS'
    }
  ])
}

/**
 * Asserts that POST /beta-2/deliveries rejected the payload with validation errors.
 * @param {Object} response - API response
 */
export function expectDeliveryRejected(response) {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    // TODO: Expect a 'detail' value once this is completed: https://eaflood.atlassian.net/browse/DWTC-221
    detail: expect.stringMatching(/^\d+ validation errors? occurred$/),
    instance: '/beta-2/deliveries',
    requestId: response.headers['x-request-id'],
    // TODO: Expect a specic set of 'errors' once this is completed: https://eaflood.atlassian.net/browse/DWTC-221
    errors: expect.any(Array)
  })
}

/**
 * Asserts that POST /beta-2/deliveries rejected unrecognised movement IDs.
 * @param {Object} response - API response
 * @param {string[]} unrecognisedMovementIds - Movement IDs that were not found
 */
export function expectDeliveryMovementIdsNotRecognised(
  response,
  unrecognisedMovementIds
) {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: beta2.badRequestType,
    title: 'Bad Request',
    detail: `Movement ID(s) not recognised: ${unrecognisedMovementIds.join(', ')}`,
    instance: '/beta-2/deliveries',
    requestId: response.headers['x-request-id']
  })
}
