import { describe, it, expect, beforeEach } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('@smoke - Waste Movement Update', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Updates', () => {
    it('should successfully update an existing waste movement', async () => {
      // First create a movement
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)

      const wasteTrackingId = createResponse.json.wasteTrackingId

      // Update the movement with different disposal codes
      const updatedData = generateBaseWasteReceiptData()
      updatedData.wasteItems[0].disposalOrRecoveryCodes = [
        {
          code: 'D1',
          weight: {
            metric: 'Tonnes',
            amount: 3.0,
            isEstimate: false
          }
        }
      ]

      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          wasteTrackingId,
          updatedData
        )

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({})
    })
    it(
      'should successfully update an existing waste movement with a different apiCode if it corresponds to the same orgId' +
        ' @allure.label.tag:DWT-823',
      async () => {
        await addAllureLink('/DWT-823', 'DWT-823', 'jira')

        // This organisation will have multiple API codes
        const orgWithMultipleApiCodes = randomUUID()
        const orgApiCode1 =
          await globalThis.apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
            orgWithMultipleApiCodes
          )
        wasteReceiptData.apiCode = orgApiCode1.json.code
        // wasteReceiptData.apiCode = '75ff9140-8617-406e-9163-2ba4907e645b'
        // Create a movement for the org with the first API code
        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(createResponse.statusCode).toBe(201)

        const wasteTrackingId = createResponse.json.wasteTrackingId

        // Create a second API code for the same org
        const orgApiCode2 =
          await globalThis.apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
            orgWithMultipleApiCodes
          )
        // Update the movement with a different API code from the same org
        const updatedData = generateBaseWasteReceiptData()
        updatedData.apiCode = orgApiCode2.json.code
        // updatedData.apiCode = '94d744a5-e6d0-4c71-82c8-db52405cbba5'

        const updateResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
            wasteTrackingId,
            updatedData
          )

        expect(updateResponse.statusCode).toBe(200)
        expect(updateResponse.json).toEqual({})
      }
    )
  })

  describe('Failed Updates', () => {
    it('should fail to update movement with non-existent ID', async () => {
      const nonExistentId = 'NONEXISTENT123'
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          nonExistentId,
          wasteReceiptData
        )

      expect(response.statusCode).toBe(404)
    })

    it(
      'should reject waste movement update with api code that does not correspond to the orgId of the waste movement' +
        ' @allure.label.tag:DWT-823',
      async () => {
        await addAllureLink('/DWT-823', 'DWT-823', 'jira')

        // First create a movement
        const createResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(createResponse.statusCode).toBe(201)

        const wasteTrackingId = createResponse.json.wasteTrackingId

        // Update the movement with different disposal codes
        const updatedData = generateBaseWasteReceiptData()
        updatedData.apiCode = '5a6058cc-ac78-47e1-b1b3-37b5eca15cb2'

        const updateResponse =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
            wasteTrackingId,
            updatedData
          )

        expect(updateResponse.statusCode).toBe(400)
        expect(updateResponse.json).toEqual({
          validation: {
            errors: [
              {
                key: 'apiCode',
                errorType: 'BusinessRuleViolation',
                message:
                  'the API Code supplied does not relate to the same Organisation as created the original waste item record'
              }
            ]
          }
        })
      }
    )
  })

  describe('Update is successful with warnings', () => {
    it('should update movement with warnings when missing disposal or recovery codes', async () => {
      await addAllureLink('/DWT-833', 'DWT-833', 'jira')
      // First create a movement
      const createResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(createResponse.statusCode).toBe(201)

      const wasteTrackingId = createResponse.json.wasteTrackingId

      // Update the movement with different disposal codes
      const updatedData = generateBaseWasteReceiptData()
      delete updatedData.wasteItems[0].disposalOrRecoveryCodes

      const updateResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          wasteTrackingId,
          updatedData
        )

      expect(updateResponse.statusCode).toBe(200)
      expect(updateResponse.json).toEqual({
        validation: {
          warnings: [
            {
              key: 'wasteItems.0.disposalOrRecoveryCodes',
              errorType: 'NotProvided',
              message:
                'wasteItems[0].disposalOrRecoveryCodes is required for proper waste tracking and compliance'
            }
          ]
        }
      })
    })
  })
})
