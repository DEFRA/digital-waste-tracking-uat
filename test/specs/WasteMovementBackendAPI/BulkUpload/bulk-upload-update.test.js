import { describe, it, expect, beforeEach } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Bulk Upload Update', () => {
  let movements

  beforeEach(async () => {
    await addAllureLink('/DWT-1515', 'DWT-1515', 'jira')
    await addAllureLink('/DWT-1393', 'DWT-1393', 'jira')
    movements = [
      generateBaseBulkUploadMovement(),
      generateBaseBulkUploadMovement()
    ]
  })

  describe('Waste movements updated successfully', () => {
    it('should accept bulk update of a single movement after create', async () => {
      const singleMovement = [generateBaseBulkUploadMovement()]
      const bulkUploadId = randomUUID()

      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          singleMovement
        )
      expect(createResponse.statusCode).toBe(201)

      singleMovement[0].wasteTrackingId =
        createResponse.json.movements[0].wasteTrackingId

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          singleMovement
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_UPDATED',
        movements: [{}]
      })
    })

    it('should accept bulk update of two movements after create', async () => {
      const bulkUploadId = randomUUID()

      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movements
        )
      expect(createResponse.statusCode).toBe(201)

      movements[0].wasteTrackingId =
        createResponse.json.movements[0].wasteTrackingId
      movements[1].wasteTrackingId =
        createResponse.json.movements[1].wasteTrackingId

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          movements
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_UPDATED',
        movements: [{}, {}]
      })
    })

    it('should be idempotent when same bulkUploadId is used for concurrent update requests', async () => {
      const bulkUploadId = randomUUID()

      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movements
        )
      expect(createResponse.statusCode).toBe(201)

      movements[0].wasteTrackingId =
        createResponse.json.movements[0].wasteTrackingId
      movements[1].wasteTrackingId =
        createResponse.json.movements[1].wasteTrackingId

      const [response1, response2] = await Promise.all([
        globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          movements
        ),
        globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          movements
        )
      ])

      ;[response1, response2].forEach((response) => {
        expect(response.statusCode).toBe(200)
        expect(['MOVEMENTS_UPDATED', 'NO_MOVEMENTS_UPDATED']).toContain(
          response.json.status
        )
        expect(response.json.movements).toHaveLength(2)
        response.json.movements.forEach((m) => expect(m).toEqual({}))
      })

      expect([response1.json.status, response2.json.status].sort()).toEqual(
        ['MOVEMENTS_UPDATED', 'NO_MOVEMENTS_UPDATED'].sort()
      )
    })
  })

  describe('Waste movements not updated', () => {
    it('should reject bulk update when array is empty', async () => {
      const bulkUploadId = randomUUID()
      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          [generateBaseBulkUploadMovement()]
        )
      expect(createResponse.statusCode).toBe(201)

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
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

    it('should reject bulk update when one movement is missing a required field', async () => {
      const bulkUploadId = randomUUID()
      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          movements
        )
      expect(createResponse.statusCode).toBe(201)

      const validMovement = movements[0]
      validMovement.wasteTrackingId =
        createResponse.json.movements[0].wasteTrackingId

      const movementMissingSubmittingOrganisation = { ...movements[1] }
      movementMissingSubmittingOrganisation.wasteTrackingId =
        createResponse.json.movements[1].wasteTrackingId
      delete movementMissingSubmittingOrganisation.submittingOrganisation

      const updateMovement = [
        validMovement,
        movementMissingSubmittingOrganisation
      ]

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          updateMovement
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

    it('should reject bulk update when multiple movements have validation errors with 1, 2, or 3 errors each', async () => {
      const fourMovements = [
        generateBaseBulkUploadMovement(),
        generateBaseBulkUploadMovement(),
        generateBaseBulkUploadMovement(),
        generateBaseBulkUploadMovement()
      ]
      const bulkUploadId = randomUUID()
      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          fourMovements
        )
      expect(createResponse.statusCode).toBe(201)

      const movementWithOneError = { ...fourMovements[0] }
      movementWithOneError.wasteTrackingId =
        createResponse.json.movements[0].wasteTrackingId
      delete movementWithOneError.submittingOrganisation

      const movementWithTwoErrors = { ...fourMovements[1] }
      movementWithTwoErrors.wasteTrackingId =
        createResponse.json.movements[1].wasteTrackingId
      delete movementWithTwoErrors.submittingOrganisation
      delete movementWithTwoErrors.dateTimeReceived

      const validMovement = fourMovements[2]
      validMovement.wasteTrackingId =
        createResponse.json.movements[2].wasteTrackingId

      const movementWithThreeErrors = { ...fourMovements[3] }
      movementWithThreeErrors.wasteTrackingId =
        createResponse.json.movements[3].wasteTrackingId
      delete movementWithThreeErrors.submittingOrganisation
      delete movementWithThreeErrors.dateTimeReceived
      delete movementWithThreeErrors.receiver

      const updateMovement = [
        movementWithOneError,
        movementWithTwoErrors,
        validMovement,
        movementWithThreeErrors
      ]

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          updateMovement
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
