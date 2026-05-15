import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

/**
 * Create a movement and return its waste tracking id.
 * @param {Object} wasteReceiptData - Receipt payload for POST /movements/receive
 * @returns {Promise<string>}
 */
async function createMovementAndGetWasteTrackingId(wasteReceiptData) {
  const createResponse =
    await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
      wasteReceiptData
    )
  expect(createResponse.statusCode).toBe(201)
  expect(createResponse.json).toHaveProperty('wasteTrackingId')
  return createResponse.json.wasteTrackingId
}

describe('Production Approval Tests All Automated Scenarios', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTA-177', 'DWTA-177', 'jira')
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Bulk assessment of passing movements', () => {
    it('should pass all R and C02 scenarios when each waste tracking id satisfies its scenario', async () => {
      const r01Data = generateBaseWasteReceiptData()
      const r01WasteTrackingId =
        await createMovementAndGetWasteTrackingId(r01Data)

      const r02Data = generateBaseWasteReceiptData()
      const first = r02Data.wasteItems[0]
      r02Data.wasteItems = [first, { ...first }]
      const r02WasteTrackingId =
        await createMovementAndGetWasteTrackingId(r02Data)

      const r03Data = generateBaseWasteReceiptData()
      r03Data.carrier.meansOfTransport = 'Road'
      r03Data.carrier.vehicleRegistration = 'AB12 CDE'
      const r03WasteTrackingId =
        await createMovementAndGetWasteTrackingId(r03Data)

      const r04Data = generateBaseWasteReceiptData()
      delete r04Data.wasteItems[0].disposalOrRecoveryCodes
      const r04WasteTrackingId =
        await createMovementAndGetWasteTrackingId(r04Data)

      const r05Data = generateBaseWasteReceiptData()
      r05Data.wasteItems[0].disposalOrRecoveryCodes = [
        {
          code: 'R1',
          weight: {
            metric: 'Tonnes',
            amount: 1.5,
            isEstimate: false
          }
        },
        {
          code: 'D1',
          weight: {
            metric: 'Tonnes',
            amount: 1.0,
            isEstimate: false
          }
        }
      ]
      const r05WasteTrackingId =
        await createMovementAndGetWasteTrackingId(r05Data)

      const r07Data = generateBaseWasteReceiptData()
      r07Data.wasteItems[0].ewcCodes = ['020101', '020102']
      const r07WasteTrackingId =
        await createMovementAndGetWasteTrackingId(r07Data)

      const c02Data = generateBaseWasteReceiptData()
      c02Data.carrier.registrationNumber = null
      c02Data.carrier.reasonForNoRegistrationNumber = 'ON_SITE'
      const c02WasteTrackingId =
        await createMovementAndGetWasteTrackingId(c02Data)

      const patResponse =
        await globalThis.apis.wasteMovementBackendAPI.runProductionApprovalTests(
          [
            { scenarioId: 'R01', wasteTrackingId: r01WasteTrackingId },
            { scenarioId: 'R02', wasteTrackingId: r02WasteTrackingId },
            { scenarioId: 'R03', wasteTrackingId: r03WasteTrackingId },
            { scenarioId: 'R04', wasteTrackingId: r04WasteTrackingId },
            { scenarioId: 'R05', wasteTrackingId: r05WasteTrackingId },
            { scenarioId: 'R07', wasteTrackingId: r07WasteTrackingId },
            { scenarioId: 'C02', wasteTrackingId: c02WasteTrackingId }
          ]
        )

      expect(patResponse.statusCode).toBe(200)
      expect(patResponse.json).toEqual([
        {
          scenarioId: 'R01',
          wasteTrackingId: r01WasteTrackingId,
          status: 'Pass',
          message: ''
        },
        {
          scenarioId: 'R02',
          wasteTrackingId: r02WasteTrackingId,
          status: 'Pass',
          message: ''
        },
        {
          scenarioId: 'R03',
          wasteTrackingId: r03WasteTrackingId,
          status: 'Pass',
          message: ''
        },
        {
          scenarioId: 'R04',
          wasteTrackingId: r04WasteTrackingId,
          status: 'Pass',
          message: ''
        },
        {
          scenarioId: 'R05',
          wasteTrackingId: r05WasteTrackingId,
          status: 'Pass',
          message: ''
        },
        {
          scenarioId: 'R07',
          wasteTrackingId: r07WasteTrackingId,
          status: 'Pass',
          message: ''
        },
        {
          scenarioId: 'C02',
          wasteTrackingId: c02WasteTrackingId,
          status: 'Pass',
          message: ''
        }
      ])
    })
  })
})
