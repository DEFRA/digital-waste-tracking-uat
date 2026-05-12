/**
 * TEMPORARY — delete this folder when bulk and external API validation are unified.
 * Parity: external create tests with BusinessRuleViolation on POPs fields.
 */
import { describe, it, expect } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Bulk temporary — POPs BusinessRuleViolation (create)', () => {
  describe('Valid POPs business rules', () => {
    it('should accept bulk upload when POPs waste has valid component concentration @allure.label.tag:DWT-353', async () => {
      await addAllureLink('/DWT-353', 'DWT-353', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ code: 'ALD', concentration: 5.5 }]
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

    it('should accept bulk upload when POPs waste uses allowed component code HBB @allure.label.tag:DWT-346 @allure.label.tag:DWT-624', async () => {
      await addAllureLink('/DWT-346', 'DWT-346', 'jira')
      await addAllureLink('/DWT-624', 'DWT-624', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ code: 'HBB', concentration: 2.5 }]
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

    it('should accept bulk upload when POPs waste has multiple allowed components @allure.label.tag:DWT-346', async () => {
      await addAllureLink('/DWT-346', 'DWT-346', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        sourceOfComponents: 'OWN_TESTING',
        components: [
          { code: 'SCCPS', concentration: 2.5 },
          { code: 'CHL', concentration: 2.0 }
        ]
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

  describe('Invalid POPs business rules (BusinessRuleViolation)', () => {
    it('should reject bulk upload when POPs components are supplied but sourceOfComponents is NOT_PROVIDED @allure.label.tag:DWT-353 @allure.label.tag:DWT-624', async () => {
      await addAllureLink('/DWT-353', 'DWT-353', 'jira')
      await addAllureLink('/DWT-624', 'DWT-624', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        sourceOfComponents: 'NOT_PROVIDED',
        components: [{ code: 'ALD' }]
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
        key: '0.wasteItems.0.pops.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].pops.components" must not be provided when sourceOfComponents is NOT_PROVIDED'
      })
    })

    it('should reject bulk upload when POPs components remain on payload but containsPops is false after POPs concentration setup @allure.label.tag:DWT-353', async () => {
      await addAllureLink('/DWT-353', 'DWT-353', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ code: 'ALD', concentration: 5.5 }]
      }
      movement.wasteItems[0].containsPops = false

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
        key: '0.wasteItems.0.pops.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].pops.components" must not be provided when containsPops is false'
      })
    })

    it('should reject bulk upload when POPs components remain on payload but containsPops is false after POPs component codes setup @allure.label.tag:DWT-346 @allure.label.tag:DWT-353', async () => {
      await addAllureLink('/DWT-346', 'DWT-346', 'jira')
      await addAllureLink('/DWT-353', 'DWT-353', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        sourceOfComponents: 'PROVIDED_WITH_WASTE',
        components: [{ code: 'SCCPS', concentration: 2.5 }]
      }
      movement.wasteItems[0].containsPops = false

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
        key: '0.wasteItems.0.pops.components',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].pops.components" must not be provided when containsPops is false'
      })
    })

    it('should reject bulk upload when POPs is indicated but sourceOfComponents is not provided @allure.label.tag:DWT-624', async () => {
      await addAllureLink('/DWT-623', 'DWT-623', 'jira')
      await addAllureLink('/DWT-624', 'DWT-624', 'jira')
      const movement = generateBaseBulkUploadMovement()
      movement.wasteItems[0].containsPops = true
      movement.wasteItems[0].pops = {
        components: [{ code: 'PFOS', concentration: 2.5 }]
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
        key: '0.wasteItems.0.pops.sourceOfComponents',
        errorType: 'BusinessRuleViolation',
        message:
          '"wasteItems[0].pops.sourceOfComponents" is required when containsPops is true'
      })
    })
  })
})
