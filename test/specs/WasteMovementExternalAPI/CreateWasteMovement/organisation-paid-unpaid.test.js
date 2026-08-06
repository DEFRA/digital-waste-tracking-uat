import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { createOrganisationAndGetApiCode } from '../../../support/helpers/organisation.js'
import { randomUUID } from 'crypto'

describe('Organisations paid vs. unpaid validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Paid organisations validation', () => {
    const organisationId = randomUUID()
    const disabledDate = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 365 * 1
    ).toISOString() // 1 year from now

    it('The disabled after date should be returned in the headers when creating a movement for a paid organisation', async () => {
      const apiCode = await createOrganisationAndGetApiCode(
        randomUUID(),
        organisationId,
        disabledDate
      )

      wasteReceiptData.apiCode = apiCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(201)
      expect(response.headers['service-charge-expiry-date']).toBe(disabledDate)
      expect(response.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })
  })

  describe('Unpaid organisations validation', () => {
    const organisationId = randomUUID()
    const disabledDate = new Date(
      Date.now() - 1000 * 60 * 60 * 24 * 365 * 1
    ).toISOString() // 1 year in the past

    it('A 402 Payment Required error should be returned when creating a movement for an unpaid organisation', async () => {
      const apiCode = await createOrganisationAndGetApiCode(
        randomUUID(),
        organisationId,
        disabledDate
      )

      wasteReceiptData.apiCode = apiCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(402)
      expect(response.json).toEqual({
        statusCode: 402,
        error: 'Payment Required',
        message: 'Payment Required'
      })
    })
  })
})
