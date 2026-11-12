import { describe, it, beforeEach } from '@jest/globals'
import {
  beta2,
  generateBaseWasteReceiptData
} from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectBothReceiptsAccepted,
  expectBothReceiptsRejected
} from '~/test/support/helpers/phase-parity/create-receipt.js'

const consignmentCodes = {
  valid: [
    ['EA / NRW', 'CJTILE/A0001'],
    ['EA / NRW with digits before the slash', '123456/A0001'],
    ['EA / NRW with a digit in the premises code', 'CJ123E/A0001'],
    ['EA / NRW with a trailing letter', 'CJTILE/A0001B'],
    ['SEPA SA', 'SA1234567'],
    ['SEPA SB', 'SB1234567'],
    ['SEPA SC', 'SC1234567'],
    ['NIEA DA', 'DA1234567'],
    ['NIEA DB', 'DB1234567'],
    ['NIEA DC', 'DC1234567']
  ],
  invalid: [
    ['SEPA code one digit short', 'SA123456'],
    ['NIEA code one digit long', 'DA12345678'],
    ['EA / NRW code with a short serial', 'CJTILE/A01'],
    ['EA / NRW code with a one-character premises code', 'C/A0001'],
    ['plain text', 'NOT-A-CODE']
  ]
}

describe('Create receipt regex parity', () => {
  let phase1Receipt
  let phase2Receipt

  beforeEach(async () => {
    phase1Receipt = generateBaseWasteReceiptData()
    phase2Receipt = beta2.generateBaseReceiptWithoutDeliveryIdData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  /**
   * Puts a consignment code on a hazardous phase 1 receipt and phase 2 receipt.
   * @param {string} code - Consignment code
   */
  function useConsignmentCode(code) {
    phase1Receipt.wasteItems[0].ewcCodes = ['200121']
    phase1Receipt.wasteItems[0].containsHazardous = true
    phase1Receipt.wasteItems[0].hazardous = {
      hazCodes: ['HP_1', 'HP_3'],
      sourceOfComponents: 'PROVIDED_WITH_WASTE',
      components: [
        {
          name: 'Mercury',
          concentration: 0.25
        }
      ]
    }
    phase1Receipt.hazardousWasteConsignmentCode = code

    phase2Receipt.wasteItems[0].classification = beta2.hazardousClassification()
    phase2Receipt.consignmentNote = { code }
  }

  describe('Consignment code', () => {
    it.each(consignmentCodes.valid)(
      'should accept a receipt when the consignment code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        useConsignmentCode(code)

        await expectBothReceiptsAccepted(phase1Receipt, phase2Receipt)
      }
    )

    it.each(consignmentCodes.invalid)(
      'should reject a receipt when the consignment code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        useConsignmentCode(code)

        await expectBothReceiptsRejected(phase1Receipt, phase2Receipt)
      }
    )
  })
})
