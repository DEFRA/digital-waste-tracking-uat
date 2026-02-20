import { describe, it, expect, beforeEach } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Bulk Upload Create', () => {
  let movements

  beforeEach(async () => {
    await addAllureLink('/DWT-1495', 'DWT-1495', 'jira')
    await addAllureLink('/DWT-1413', 'DWT-1413', 'jira')
    movements = [
      generateBaseBulkUploadMovement(),
      generateBaseBulkUploadMovement()
    ]
  })

  describe('Waste movements created successfully', () => {
    it('should accept bulk upload of a single movement', async () => {
      const singleMovement = [generateBaseBulkUploadMovement()]
      const bulkUploadId = randomUUID()

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          singleMovement
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [{ wasteTrackingId: expect.any(String) }]
      })
    })

    it('should accept bulk upload of two movements from base waste receipt data', async () => {
      const bulkUploadId = randomUUID()

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
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

    it('should be idempotent when same bulkUploadId is used for concurrent requests', async () => {
      const bulkUploadId = randomUUID()

      const [response1, response2] = await Promise.all([
        globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movements
        ),
        globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movements
        )
      ])

      ;[response1, response2].forEach((response) => {
        expect([200, 201]).toContain(response.statusCode)
        expect(['MOVEMENTS_CREATED', 'MOVEMENTS_NOT_CREATED']).toContain(
          response.json.status
        )
        expect(response.json.movements).toHaveLength(2)
      })
      expect(
        new Set(response1.json.movements.map((m) => m.wasteTrackingId))
      ).toEqual(new Set(response2.json.movements.map((m) => m.wasteTrackingId)))

      expect([response1.json.status, response2.json.status].sort()).toEqual(
        ['MOVEMENTS_CREATED', 'MOVEMENTS_NOT_CREATED'].sort()
      )
    })
  })

  describe('Waste movements not created', () => {
    it('should reject bulk upload when array is empty', async () => {
      const bulkUploadId = randomUUID()

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
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

    it('should reject bulk upload when one movement is missing a required field', async () => {
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

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movementsWithInvalidItem
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(2)
      expect(response.json[1].validation.errors).toHaveLength(1)
      expect(response.json[1].validation.errors[0]).toMatchObject({
        errorType: 'NotProvided',
        key: '1',
        message: expect.stringContaining('submittingOrganisation')
      })
    })

    it('should reject bulk upload when multiple movements have validation errors with 1, 2, or 3 errors each', async () => {
      const validMovement = generateBaseBulkUploadMovement()
      const movementWithOneError = { ...generateBaseBulkUploadMovement() }
      delete movementWithOneError.submittingOrganisation

      const movementWithTwoErrors = { ...generateBaseBulkUploadMovement() }
      delete movementWithTwoErrors.submittingOrganisation
      delete movementWithTwoErrors.dateTimeReceived

      const movementWithThreeErrors = { ...generateBaseBulkUploadMovement() }
      delete movementWithThreeErrors.submittingOrganisation
      delete movementWithThreeErrors.dateTimeReceived
      delete movementWithThreeErrors.receiver

      const movementsWithMultipleInvalid = [
        movementWithOneError,
        movementWithTwoErrors,
        validMovement,
        movementWithThreeErrors
      ]
      const bulkUploadId = randomUUID()

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movementsWithMultipleInvalid
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(4)
      expect(response.json[0].validation.errors).toHaveLength(1)
      expect(response.json[1].validation.errors).toHaveLength(2)
      expect(response.json[2]).toEqual({})
      expect(response.json[3].validation.errors).toHaveLength(3)
    })
  })
})
