/**
 * TEMPORARY — delete this folder when bulk and external API validation are unified.
 * Parity: external create tests — hazardous concentration, hazCodes, indicator (BusinessRuleViolation negatives + matching positives).
 */
import { describe, it, expect } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Bulk temporary — hazardous BusinessRuleViolation (create)', () => {
  describe('Valid hazardous rules', () => {
    it('should accept bulk upload when hazardous waste has valid component concentration @allure.label.tag:DWT-354', async () => {
      await addAllureLink('/DWT-354', 'DWT-354', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        hazCodes: ['HP_1', 'HP_3', 'HP_5'],
        components: [{ name: 'Mercury', concentration: 5.5 }]
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

    it('should accept bulk upload when hazardous waste has a single valid hazardous property code', async () => {
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_1'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 12.5 }]
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

    it('should accept bulk upload when hazardous indicator is true, sourceOfComponents is NOT_PROVIDED, and only hazCodes are provided', async () => {
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED',
        hazCodes: ['HP_6']
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

    it('should accept bulk upload when hazardous indicator is false and hazardous block is NOT_PROVIDED only @allure.label.tag:DWT-351', async () => {
      await addAllureLink('/DWT-351', 'DWT-351', 'jira')
      const movement = generateBaseBulkUploadMovement()
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

    it('should accept bulk upload when hazardous indicator is true and components are provided with hazCodes @allure.label.tag:DWT-351', async () => {
      await addAllureLink('/DWT-351', 'DWT-351', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_6'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 0.25 }]
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

  describe('Invalid hazardous rules (BusinessRuleViolation)', () => {
    it('should reject bulk upload when hazardous components are supplied but sourceOfComponents is NOT_PROVIDED @allure.label.tag:DWT-354 @allure.label.tag:DWT-624', async () => {
      await addAllureLink('/DWT-354', 'DWT-354', 'jira')
      await addAllureLink('/DWT-624', 'DWT-624', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED',
        hazCodes: ['HP_1', 'HP_3', 'HP_5'],
        components: [{ name: 'Mercury' }]
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
        key: '0.wasteItems.0.hazardous.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].hazardous.components" must not be provided when sourceOfComponents is NOT_PROVIDED'
      })
    })

    it('should reject bulk upload when concentration is provided for hazardous components on non-hazardous waste @allure.label.tag:DWT-354', async () => {
      await addAllureLink('/DWT-354', 'DWT-354', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = false
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED',
        components: [{ name: 'Mercury', concentration: 50 }]
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
        key: '0.wasteItems.0.hazardous.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].hazardous.components" must not be provided when containsHazardous is false'
      })
    })

    it('should reject bulk upload when hazardous indicator is false, sourceOfComponents is NOT_PROVIDED, and components are provided @allure.label.tag:DWT-351 @allure.label.tag:DWT-624', async () => {
      await addAllureLink('/DWT-351', 'DWT-351', 'jira')
      await addAllureLink('/DWT-624', 'DWT-624', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = false
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'NOT_PROVIDED',
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
        key: '0.wasteItems.0.hazardous.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].hazardous.components" must not be provided when containsHazardous is false'
      })
    })

    it('should reject bulk upload when waste is hazardous but hazCodes is empty @allure.label.tag:DWT-631', async () => {
      await addAllureLink('/DWT-631', 'DWT-631', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        hazCodes: [],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 12.5 }]
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
        key: '0.wasteItems.0.hazardous',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].hazardous.hazCodes" is required when containsHazardous is true'
      })
    })

    it('should reject bulk upload when waste is hazardous but hazCodes is missing @allure.label.tag:DWT-631', async () => {
      await addAllureLink('/DWT-631', 'DWT-631', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = true
      movement.wasteItems[0].hazardous = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 12.5 }]
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
        key: '0.wasteItems.0.hazardous',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].hazardous.hazCodes" is required when containsHazardous is true'
      })
    })

    it('should reject bulk upload when waste is not hazardous but hazardous property codes and components are still supplied @allure.label.tag:DWT-631', async () => {
      await addAllureLink('/DWT-631', 'DWT-631', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsHazardous = false
      movement.wasteItems[0].hazardous = {
        hazCodes: ['HP_15'],
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ name: 'Mercury', concentration: 12.5 }]
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
        key: '0.wasteItems.0.hazardous.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].hazardous.components" must not be provided when containsHazardous is false'
      })
    })
  })
})
