import { describe, it, expect, beforeEach } from '@jest/globals'
import { randomUUID } from 'node:crypto'
import {
  generateBaseBulkUploadMovement,
  generateBaseWasteReceiptData
} from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Retrieve movement (Functionality only in Pre Prod)', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-45', 'DWTA-45', 'jira')
  })

  describe('By waste tracking ID', () => {
    it('should return persisted movement details for wasteTrackingId @allure.label.tag:DWTA-45', async () => {
      const wasteReceiptData = generateBaseWasteReceiptData()
      await authenticateAndSetToken(
        globalThis.testConfig.cognitoClientId,
        globalThis.testConfig.cognitoClientSecret
      )
      const { statusCode: externalCreateStatus, json: externalCreateBody } =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )
      expect(externalCreateStatus).toBe(201)
      const wasteTrackingId = externalCreateBody.wasteTrackingId

      const { statusCode: qaRetrieveStatus, json: qaMovements } =
        await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByWasteTrackingId(
          wasteTrackingId
        )

      expect(qaRetrieveStatus).toBe(200)
      expect(qaMovements).toHaveLength(1)
      const movement = qaMovements[0]
      expect(movement.wasteTrackingId).toBe(wasteTrackingId)
      expect(movement.revision).toEqual(expect.any(Number))
      expect(movement).toHaveProperty('orgId')
      expect(movement.traceId).toEqual(expect.any(String))
      expect(movement.receipt.movement.apiCode).toBe(wasteReceiptData.apiCode)
    })

    it('should return both revisions when includeHistory is true after create and update @allure.label.tag:DWTA-45', async () => {
      await authenticateAndSetToken(
        globalThis.testConfig.cognitoClientId,
        globalThis.testConfig.cognitoClientSecret
      )
      const { json: externalCreateBody } =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          generateBaseWasteReceiptData()
        )
      const wasteTrackingId = externalCreateBody.wasteTrackingId

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
      const { statusCode: externalUpdateStatus } =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          wasteTrackingId,
          updatedData
        )
      expect(externalUpdateStatus).toBe(200)

      const { statusCode: qaRetrieveStatus, json: qaMovements } =
        await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByWasteTrackingId(
          wasteTrackingId,
          true
        )

      expect(qaRetrieveStatus).toBe(200)
      expect(qaMovements).toHaveLength(2)
      expect(qaMovements[0].wasteTrackingId).toBe(wasteTrackingId)
      expect(qaMovements[1].wasteTrackingId).toBe(wasteTrackingId)
      expect(qaMovements[0].revision).toBe(2)
      expect(qaMovements[1].revision).toBe(1)
    })
  })

  describe('By bulk ID', () => {
    it('should return all related movements for bulkId @allure.label.tag:DWTA-45', async () => {
      const firstMovementPayload = generateBaseBulkUploadMovement()
      const secondMovementPayload = generateBaseBulkUploadMovement()
      const bulkId = randomUUID()
      const { statusCode: bulkCreateStatus, json: bulkCreateResponse } =
        await globalThis.apis.wasteMovementBackendAPI.bulkUploadCreate(bulkId, [
          firstMovementPayload,
          secondMovementPayload
        ])
      expect(bulkCreateStatus).toBe(201)
      const movementsFromBulkCreate = bulkCreateResponse.movements

      const { statusCode: qaRetrieveStatus, json: movementsFromQaRetrieve } =
        await globalThis.apis.wasteMovementBackendAPI.qaRetrieveMovementsByBulkId(
          bulkId
        )

      expect(qaRetrieveStatus).toBe(200)
      expect(movementsFromQaRetrieve).toHaveLength(2)

      const originalPayloadByWasteTrackingId = new Map([
        [movementsFromBulkCreate[0].wasteTrackingId, firstMovementPayload],
        [movementsFromBulkCreate[1].wasteTrackingId, secondMovementPayload]
      ])
      const compareRowsByWasteTrackingId = (a, b) =>
        a.wasteTrackingId.localeCompare(b.wasteTrackingId)
      const movementsFromBulkCreateSorted = [...movementsFromBulkCreate].sort(
        compareRowsByWasteTrackingId
      )
      const movementsFromQaRetrieveSorted = [...movementsFromQaRetrieve].sort(
        compareRowsByWasteTrackingId
      )

      expect(movementsFromQaRetrieveSorted[0].wasteTrackingId).toBe(
        movementsFromBulkCreateSorted[0].wasteTrackingId
      )
      expect(movementsFromQaRetrieveSorted[1].wasteTrackingId).toBe(
        movementsFromBulkCreateSorted[1].wasteTrackingId
      )

      expect(movementsFromQaRetrieveSorted[0]).toMatchObject({
        revision: expect.any(Number),
        bulkId,
        traceId: expect.any(String),
        submittingOrganisation: {
          defraCustomerOrganisationId: originalPayloadByWasteTrackingId.get(
            movementsFromBulkCreateSorted[0].wasteTrackingId
          ).submittingOrganisation.defraCustomerOrganisationId
        }
      })
      expect(movementsFromQaRetrieveSorted[0]).toHaveProperty('orgId')

      expect(movementsFromQaRetrieveSorted[1]).toMatchObject({
        revision: expect.any(Number),
        bulkId,
        traceId: expect.any(String),
        submittingOrganisation: {
          defraCustomerOrganisationId: originalPayloadByWasteTrackingId.get(
            movementsFromBulkCreateSorted[1].wasteTrackingId
          ).submittingOrganisation.defraCustomerOrganisationId
        }
      })
      expect(movementsFromQaRetrieveSorted[1]).toHaveProperty('orgId')
    })
  })
})
