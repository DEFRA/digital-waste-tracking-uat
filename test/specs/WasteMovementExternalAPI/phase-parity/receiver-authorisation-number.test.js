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

// Values that exercise each alternative of the receiver authorisation number
// regex shared by phase 1 POST /movements/receive and phase 2 POST /beta-2/receipts.
// Taken from the phase-1 parity lists in waste-movement-backend schema tests.
const authorisationNumbers = {
  valid: [
    ['England XX9999XX', 'HP3456XX'],
    ['England lower case', 'hp3456xx'],
    ['England EPR with 4 digit deployment', 'EPR/AB1234CD/D6789'],
    ['England 4 digit deployment without EPR', 'AB1234CD/D6789'],
    ['England EPR with 5 digit deployment', 'EPR/AB1234CD/D67890'],
    ['England 5 digit deployment without EPR', 'AB1234CD/D67890'],
    ['England EAWML with 6 digits', 'EAWML123456'],
    ['England EAWML with 5 digits', 'EAWML12345'],
    ['England WML with 6 digits', 'WML987654'],
    ['England WML with 5 digits', 'WML98765'],
    ['Scotland PPC/A', 'PPC/A/1234567'],
    ['Scotland WML/L', 'WML/L/7654321'],
    ['Scotland WML/L with suffix', 'WML/L/7654321/12'],
    ['Scotland WML/W with suffix', 'WML/W/7654321/34'],
    ['Scotland WML/N with suffix', 'WML/N/7654321/56'],
    ['Scotland WML/E with suffix', 'WML/E/7654321/78'],
    ['Scotland SEPA', 'PPC/A/SEPA1234-5678'],
    ['Scotland EAS', 'EAS/P/123456'],
    ['Wales XX9999XX', 'NW1234CD'],
    ['Wales EPR', 'EPR/NW1234CD'],
    ['Northern Ireland P format', 'P1234/56A'],
    ['Northern Ireland WPPC', 'WPPC 12/34'],
    ['Northern Ireland P format with version', 'P1234/56A/V1'],
    ['Northern Ireland WPPC with version', 'WPPC 12/34/V2'],
    ['Northern Ireland combined WML and LN', 'WML 07/61 LN/13/02/M/V2'],
    [
      'Northern Ireland combined WML and LN without suffix',
      'WML 07/61 LN/13/02'
    ],
    ['Northern Ireland combined WML and PAC', 'WML 04/38 PAC/2014/WCL001']
  ],
  invalid: [
    ['EAWML with a dash', 'EAWML-10001'],
    ['GMB format', 'GMB383838X'],
    ['WEF format', 'WEF1234567'],
    ['plain text', 'INVALID-AUTH'],
    ['numeric only', '1234567890'],
    ['Northern Ireland WML on its own', 'WML 07/61'],
    ['Northern Ireland WML transfer on its own', 'WML 19/36/T'],
    ['Northern Ireland LN on its own', 'LN/13/02'],
    ['Northern Ireland LN with suffixes on its own', 'LN/13/02/M/V2'],
    ['Northern Ireland PAC on its own', 'PAC/2014/WCL001']
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

  describe('Receiver authorisation number', () => {
    it.each(authorisationNumbers.valid)(
      'should accept a receipt when the receiver authorisation number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, authorisationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receiver.authorisationNumber = authorisationNumber
        phase2Receipt.receiver.authorisationNumber = authorisationNumber

        await expectBothReceiptsAccepted(phase1Receipt, phase2Receipt)
      }
    )

    it.each(authorisationNumbers.invalid)(
      'should reject a receipt when the receiver authorisation number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, authorisationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receiver.authorisationNumber = authorisationNumber
        phase2Receipt.receiver.authorisationNumber = authorisationNumber

        await expectBothReceiptsRejected(phase1Receipt, phase2Receipt)
      }
    )
  })
})
