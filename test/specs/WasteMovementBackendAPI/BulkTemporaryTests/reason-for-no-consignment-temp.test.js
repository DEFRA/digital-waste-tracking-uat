/**
 * TEMPORARY — delete this folder when bulk and external API validation are unified.
 * Parity: WasteMovementExternalAPI Create — reason for no consignment code (BusinessRuleViolation).
 */
import { describe, it, expect } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Bulk temporary — reason for no consignment code (create)', () => {
  describe('Valid reason for no consignment code', () => {
    it('should accept bulk upload when hazardous EWC has no consignment code and reason is NO_DOC_WITH_WASTE @allure.label.tag:DWT-328', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['200121']
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
      }
      movement.reasonForNoConsignmentCode = 'NO_DOC_WITH_WASTE'

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [{ wasteTrackingId: expect.any(String) }]
      })
    })

    it('should accept bulk upload when hazardous EWC has no consignment code and reason is NON_HAZ_WASTE_TRANSFER @allure.label.tag:DWT-328', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['200121']
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
      }
      movement.reasonForNoConsignmentCode = 'NON_HAZ_WASTE_TRANSFER'

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [{ wasteTrackingId: expect.any(String) }]
      })
    })

    it('should accept bulk upload when mixed EWC list includes hazardous codes and reason is HWRC_RECEIPT @allure.label.tag:DWT-328', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['020101', '150107', '150110']
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
      }
      movement.reasonForNoConsignmentCode = 'HWRC_RECEIPT'

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [{ wasteTrackingId: expect.any(String) }]
      })
    })

    it('should accept bulk upload for non-hazardous waste without reason for no consignment code @allure.label.tag:DWT-328', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['020101', '150107']
      movement.wasteItems[0].containsHazardous = false
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED'
      }

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(201)
      expect(response.json).toEqual({
        status: 'MOVEMENTS_CREATED',
        movements: [{ wasteTrackingId: expect.any(String) }]
      })
    })
  })

  describe('Invalid reason for no consignment code (BusinessRuleViolation)', () => {
    it('should reject bulk upload when hazardous EWC is present, no consignment code, and reason is omitted @allure.label.tag:DWT-328 @allure.label.tag:DWT-797', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      await addAllureLink('/DWT-797', 'DWT-797', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['200121']
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
      }

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(1)
      expect(response.json[0].validation.errors).toHaveLength(1)
      expect(response.json[0].validation.errors[0]).toEqual({
        key: '0',
        errorType: 'BusinessRuleViolation',
        message:
          '"reasonForNoConsignmentCode" is required when wasteItems[*].ewcCodes contains a hazardous code and hazardousWasteConsignmentCode is not provided'
      })
    })

    it('should reject bulk upload when hazardous EWC is present, no consignment code, and reason is empty @allure.label.tag:DWT-328 @allure.label.tag:DWT-797', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      await addAllureLink('/DWT-797', 'DWT-797', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['200121']
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
      }
      movement.reasonForNoConsignmentCode = ''

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(1)
      expect(response.json[0].validation.errors).toHaveLength(1)
      expect(response.json[0].validation.errors[0]).toEqual({
        key: '0',
        errorType: 'BusinessRuleViolation',
        message:
          '"reasonForNoConsignmentCode" is required when wasteItems[*].ewcCodes contains a hazardous code and hazardousWasteConsignmentCode is not provided'
      })
    })

    it('should reject bulk upload when hazardous EWC is present, no consignment code, and reason is null @allure.label.tag:DWT-328 @allure.label.tag:DWT-797', async () => {
      await addAllureLink('/DWT-328', 'DWT-328', 'jira')
      await addAllureLink('/DWT-797', 'DWT-797', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].ewcCodes = ['200121']
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1', 'HP_3'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
      }
      movement.reasonForNoConsignmentCode = null

      const response =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(
          randomUUID(),
          [movement]
        )

      expect(response.statusCode).toBe(400)
      expect(Array.isArray(response.json)).toBe(true)
      expect(response.json).toHaveLength(1)
      expect(response.json[0].validation.errors).toHaveLength(1)
      expect(response.json[0].validation.errors[0]).toEqual({
        key: '0',
        errorType: 'BusinessRuleViolation',
        message:
          '"reasonForNoConsignmentCode" is required when wasteItems[*].ewcCodes contains a hazardous code and hazardousWasteConsignmentCode is not provided'
      })
    })
  })
})
