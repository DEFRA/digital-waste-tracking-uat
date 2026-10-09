import { expect } from '@jest/globals'
import { beta2 } from '../../test-data-manager.js'

/**
 * Asserts that POST /beta-2/deliveries recorded a delivery.
 * @param {Object} response - API response
 * @param {string[]} movementIds - Movement IDs submitted on the delivery
 */
export function expectDeliveryCreated(response, movementIds) {
  expect(response.statusCode).toBe(201)
  expect(response.json).toEqual({
    data: {
      deliveries: [
        {
          deliveryId: expect.any(String),
          movementIds,
          wasteType: 'NON_HAZARDOUS'
        }
      ]
    },
    validation: {
      warnings: []
    }
  })
}

/**
 * Asserts that POST /beta-2/deliveries rejected the payload.
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
