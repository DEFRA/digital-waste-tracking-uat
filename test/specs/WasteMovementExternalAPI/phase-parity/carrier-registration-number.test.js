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

// Values that exercise each alternative of the carrier registration number
// regex shared by phase 1 POST /movements/receive and phase 2 POST /beta-2/receipts.
// Taken from the phase-1 parity lists in waste-movement-backend schema tests.
const carrierRegistrationNumbers = {
  valid: [
    ['England and NRW lower tier, shortest', 'CBDL999'],
    ['England and NRW lower tier', 'CBDL99999'],
    ['England and NRW lower tier, long', 'CBDL99999999999999999999'],
    ['England and NRW upper tier, shortest', 'CBDU999'],
    ['England and NRW upper tier', 'CBDU99999'],
    ['England and NRW upper tier, long', 'CBDU99999999999999999999'],
    ['SEPA EAS/R with six digits', 'EAS/R/999999'],
    ['SEPA EAS/R with seven digits', 'EAS/R/9999999'],
    ['SEPA WCR/R', 'WCR/R/9999999'],
    ['SEPA SCO', 'SCO/999999'],
    ['SEPA SEA', 'SEA/999999'],
    ['SEPA SNO', 'SNO/999999'],
    ['SEPA SWE', 'SWE/999999'],
    ['SEPA SCO with /B', 'SCO/999999/B'],
    ['SEPA SCO with /CB', 'SCO/999999/CB'],
    ['SEPA SEA with /CB', 'SEA/999999/CB'],
    ['SEPA SNO with /CB', 'SNO/999999/CB'],
    ['SEPA SWE with /CB', 'SWE/999999/CB'],
    ['SEPA WCR', 'WCR/999999'],
    ['SEPA WCR with letters', 'WCR/ZZZZZZ'],
    ['SEPA PCT, shortest', 'PCT-A-999'],
    ['SEPA PCT, longest', 'PCT-E-9999999'],
    ['Northern Ireland upper tier, shortest', 'ROC UT 9'],
    ['Northern Ireland upper tier, longest', 'ROC UT 99999'],
    ['Northern Ireland lower tier, shortest', 'ROC LT 9'],
    ['Northern Ireland lower tier, longest', 'ROC LT 99999'],
    ['lower case', 'cbdu99999']
  ],
  invalid: [
    ['no tier letter', 'CBD999'],
    ['unknown tier letter', 'CBDT999'],
    ['England lower tier with too few digits', 'CBDL99'],
    ['England upper tier with too few digits', 'CBDU99'],
    ['SEPA EAS/R with too few digits', 'EAS/R/99999'],
    ['SEPA EAS/R with too many digits', 'EAS/R/99999999'],
    ['SEPA EAS/P, a site permit', 'EAS/P/9999999'],
    ['SEPA WCR/R with too few digits', 'WCR/R/999999'],
    ['SEPA WCR/R with too many digits', 'WCR/R/99999999'],
    ['SEPA WCR with too few characters', 'WCR/02bd5'],
    ['SEPA WCR with too many characters', 'WCR/02bd5f1'],
    ['SEPA WCR with a hyphen', 'WCR/02b-5f'],
    ['SEPA SCO with too few digits', 'SCO/99999'],
    ['SEPA SCO with too many digits', 'SCO/9999999'],
    ['SEPA SCO with too few digits before /CB', 'SCO/99999/CB'],
    ['SEPA SCO with an unknown suffix', 'SCO/999999/X'],
    ['SEPA SCO with a doubled suffix', 'SCO/999999/CBB'],
    ['SEPA SEA with /B', 'SEA/999999/B'],
    ['two-letter SEPA prefix', 'SC/999999'],
    ['unknown SEPA prefix', 'SCD/999999'],
    ['Northern Ireland without tier T', 'ROC U 9'],
    ['Northern Ireland lower tier without T', 'ROC L 9'],
    ['Northern Ireland unknown tier', 'ROC DT 9'],
    ['Northern Ireland upper tier with too many digits', 'ROC UT 999999'],
    ['Northern Ireland lower tier with too many digits', 'ROC LT 999999'],
    ['whitespace only', '   '],
    ['PCT with a digit for the letter', 'PCT-2-9999999'],
    ['PCT with a trailing letter', 'PCT-E-999999A']
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

  describe('Carrier registration number', () => {
    it.each(carrierRegistrationNumbers.valid)(
      'should accept a receipt when the carrier registration number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, registrationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.carrier.registrationNumber = registrationNumber
        phase2Receipt.carrier.registrationNumber = registrationNumber

        await expectBothReceiptsAccepted(phase1Receipt, phase2Receipt)
      }
    )

    it.each(carrierRegistrationNumbers.invalid)(
      'should reject a receipt when the carrier registration number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, registrationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.carrier.registrationNumber = registrationNumber
        phase2Receipt.carrier.registrationNumber = registrationNumber

        await expectBothReceiptsRejected(phase1Receipt, phase2Receipt)
      }
    )
  })
})
