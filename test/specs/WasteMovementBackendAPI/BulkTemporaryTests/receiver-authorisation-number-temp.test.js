/**
 * TEMPORARY — delete this folder when bulk and external API validation are unified.
 * Parity: WasteMovementExternalAPI Create — receiver authorisation number.
 */
import { describe, it, expect } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseBulkUploadMovement } from '~/test/support/test-data-manager.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Bulk temporary — receiver authorisation number (create)', () => {
  describe('Valid receiver authorisation numbers', () => {
    it(
      'should accept bulk upload when receiver authorisation number uses an accepted standard licence format' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = 'PPC/A/9999999'

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
      }
    )

    it(
      'should accept bulk upload when receiver authorisation number is valid for England or Wales' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = 'XX9999XX'

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
      }
    )

    it(
      'should accept bulk upload when receiver authorisation number is valid under SEPA PPC arrangements' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = 'PPC/A/SEPA9999-9999'

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
      }
    )

    it(
      'should accept bulk upload when receiver authorisation number is valid for Northern Ireland' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = 'WPPC 99/99'

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
      }
    )

    it(
      'should accept bulk upload when receiver authorisation number includes an additional activity segment for SEPA receiver sites' +
        ' @allure.label.tag:DWTA-189',
      async () => {
        await addAllureLink('/DWTA-189', 'DWTA-189', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = 'WML/L/9999999/99'

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
      }
    )
  })

  describe('Invalid receiver authorisation numbers', () => {
    it(
      'should reject bulk upload when receiver authorisation number is blank' +
        ' @allure.label.tag:DWT-339',
      async () => {
        await addAllureLink('/DWT-339', 'DWT-339', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = ''

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
          key: expect.stringMatching(/^(0\.)?receiver\.authorisationNumber$/),
          errorType: 'InvalidValue',
          message:
            '"[0].receiver.authorisationNumber" is not allowed to be empty'
        })
      }
    )

    it(
      'should reject bulk upload when receiver authorisation number is not a valid UK site authorisation number' +
        ' @allure.label.tag:DWT-578',
      async () => {
        await addAllureLink('/DWT-578', 'DWT-578', 'jira')
        const movement = generateBaseBulkUploadMovement()
        movement.receiver.authorisationNumber = 'WEF1234567'

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
          key: expect.stringMatching(/^(0\.)?receiver\.authorisationNumber$/),
          errorType: 'InvalidFormat',
          message:
            '"[0].receiver.authorisationNumber" must be in a valid UK format'
        })
      }
    )
  })
})
