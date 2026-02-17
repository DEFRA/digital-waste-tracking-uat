import { describe, it, expect, beforeEach } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('@this Bulk Upload', () => {
  let movements

  beforeEach(async () => {
    await addAllureLink('/DWT-XXX', 'DWT-XXX', 'jira')
    movements = [
      generateBaseBulkUploadMovement(),
      generateBaseBulkUploadMovement()
    ]
  })

  describe('Waste movements created successfully', () => {
    it('should accept bulk upload of two movements from base waste receipt data', async () => {
      const bulkUploadId = randomUUID()

      const response = await globalThis.apis.wasteMovementBackendAPI.bulkUpload(
        bulkUploadId,
        movements
      )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [
          { wasteTrackingId: expect.any(String) },
          { wasteTrackingId: expect.any(String) }
        ]
      })
    })

    it('should accept bulk upload of a single movement', async () => {
      const singleMovement = [generateBaseBulkUploadMovement()]
      const bulkUploadId = randomUUID()

      const response = await globalThis.apis.wasteMovementBackendAPI.bulkUpload(
        bulkUploadId,
        singleMovement
      )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [{ wasteTrackingId: expect.any(String) }]
      })
    })
  })

  describe('Waste movements not created', () => {
    it('should reject bulk upload when array is empty', async () => {
      const bulkUploadId = randomUUID()

      const response = await globalThis.apis.wasteMovementBackendAPI.bulkUpload(
        bulkUploadId,
        []
      )

      expect(response.statusCode).toBe(500)
      expect(response.json).toEqual({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An internal server error occurred'
      })
    })

    // Backend validation for invalid movements not implemented yet
    it.skip('should reject bulk upload when one movement is missing a required field', async () => {
      const validMovement = generateBaseBulkUploadMovement()
      const movementMissingSubmittingOrganisation = {
        ...validMovement
      }
      delete movementMissingSubmittingOrganisation.submittingOrganisation

      const movementsWithInvalidItem = [
        validMovement,
        movementMissingSubmittingOrganisation
      ]
      const bulkUploadId = randomUUID()

      const response = await globalThis.apis.wasteMovementBackendAPI.bulkUpload(
        bulkUploadId,
        movementsWithInvalidItem
      )

      expect(response.statusCode).toBe(400)
      expect(response.json).toHaveProperty('errors')
      expect(Array.isArray(response.json.errors)).toBe(true)
      expect(response.json.errors.length).toBeGreaterThan(0)
    })
  })
})
