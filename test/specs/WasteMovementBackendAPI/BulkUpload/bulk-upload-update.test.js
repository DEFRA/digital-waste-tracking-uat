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

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'BulkUpdateMovementRequest',
              errorType: 'UnexpectedError',
              message:
                '"BulkUpdateMovementRequest" must contain at least 1 items'
            }
          ]
        }
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

    it('should reject bulk update when movement organisation does not match original organisation @allure.label.tag:DWT-1698', async () => {
      await addAllureLink('/DWT-1698', 'DWT-1698', 'jira')

      const bulkUploadId = randomUUID()
      const originalMovements = [
        generateBaseBulkUploadMovement(),
        generateBaseBulkUploadMovement()
      ]

      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          originalMovements
        )
      expect(createResponse.statusCode).toBe(201)

      const updatedMovements = [
        {
          ...originalMovements[0],
          submittingOrganisation: {
            defraCustomerOrganisationId: 'c2a7c1d5-6f4b-4e2b-9a3b-1b2c3d4e5f60'
          },
          wasteTrackingId: createResponse.json.movements[0].wasteTrackingId
        },
        {
          ...originalMovements[1],
          wasteTrackingId: createResponse.json.movements[1].wasteTrackingId
        }
      ]

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          updatedMovements
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(2)
      expect(response.json[0].validation.errors[0]).toEqual({
        key: '0.submittingOrganisation',
        errorType: 'BusinessRuleViolation',
        message:
          '[0].submittingOrganisation the submitting organisation does not match the Organisation that created the original waste item record'
      })
      expect(response.json[1]).toEqual({})
    })

    it('should return a 400 error when one wasteTrackingId is invalid for the bulk upload @allure.label.tag:DWT-1834', async () => {
      await addAllureLink('/DWT-1834', 'DWT-1834', 'jira')
      const bulkUploadId = randomUUID()

      const createMovements = [
        generateBaseBulkUploadMovement(),
        generateBaseBulkUploadMovement()
      ]

      const createResponse =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          bulkUploadId,
          createMovements
        )

      expect(createResponse.statusCode).toBe(201)

      const validMovement = {
        ...createMovements[0],
        wasteTrackingId: createResponse.json.movements[0].wasteTrackingId
      }

      const movementWithInvalidWasteTrackingId = {
        ...createMovements[1],
        wasteTrackingId: '20ABC01A'
      }

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadUpdate(
          bulkUploadId,
          [validMovement, movementWithInvalidWasteTrackingId]
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(2)
      expect(response.json[0]).toEqual({})
      expect(response.json[1]).toHaveProperty('validation')
      expect(response.json[1].validation).toHaveProperty('errors')
      expect(response.json[1].validation.errors).toHaveLength(1)
      expect(response.json[1].validation.errors[0]).toEqual({
        key: '1.wasteTrackingId',
        errorType: 'BusinessRuleViolation',
        message: '[1].wasteTrackingId waste tracking id not found'
      })
    })
  })
})
