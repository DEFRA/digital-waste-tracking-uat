import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  beta2,
  generateBaseWasteReceiptData
} from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectReceiptCreated,
  expectReceiptRejected
} from '~/test/support/helpers/beta-2/receipt.js'

// Values that exercise each alternative of a regex shared by phase 1
// POST /movements/receive and phase 2 POST /beta-2/receipts. Taken from the
// phase-1 parity lists in waste-movement-backend schema tests.
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

// UK shapes from the shared postcode pattern. Irish Eircodes are not included:
// phase 1 receipt addresses reject them, and phase 2 addresses accept them.
const postcodes = {
  valid: [
    ['AA9A 9AA', 'SW1A 1AA'],
    ['AA9A 9AA, EC', 'EC1A 1BB'],
    ['A9A 9AA', 'W1A 0AX'],
    ['A9 9AA', 'M1 1AE'],
    ['A99 9AA', 'B33 8TH'],
    ['AA9 9AA', 'CR2 6XH'],
    ['AA99 9AA', 'DN55 1PT'],
    ['GIR 0AA', 'GIR 0AA']
  ],
  invalid: [
    ['invalid characters', 'xxx'],
    ['not a postcode', 'NOTAPOSTCODE'],
    ['UK postcode without a space', 'BS14XE'],
    ['outward code only', 'WS12'],
    ['invalid character in the outward code', 'W$12 2GQ']
  ]
}

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

const ewcCodes = {
  valid: [
    ['six digits', '020101'],
    ['six digits, municipal', '200301'],
    ['six digits, mirror entry', '170504'],
    ['six digits, another mirror entry', '191212']
  ],
  invalid: [
    ['too short', '12345'],
    ['too long', '2003011'],
    ['letters', 'INVALID'],
    ['a letter among the digits', '02010A']
  ]
}

const registrationNumberError =
  '"carrier.registrationNumber" must be in a valid England, SEPA, NRW or NI format'
const authorisationNumberError =
  '"receiver.authorisationNumber" must be in a valid UK format'
const postcodeError = '"receipt.address.postcode" must be in valid UK format'
const consignmentCodeError =
  '"hazardousWasteConsignmentCode" must be in one of the valid formats: EA/NRW (2 or more alphanumeric characters followed by / and 5-6 alphanumeric characters, e.g. CJTILE/A0001), SEPA (SA|SB|SC followed by 7 digits), or NIEA (DA|DB|DC followed by 7 digits)'
const ewcCodeError =
  '"wasteItems[0].ewcCodes[0]" must be a valid 6-digit numeric code'

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
   * Submits the current phase 1 and phase 2 create-receipt payloads.
   * @returns {Promise<void>}
   */
  async function expectBothReceiptsAccepted() {
    const phase1Response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        phase1Receipt
      )

    expect(phase1Response.statusCode).toBe(201)
    expect(phase1Response.json).toHaveProperty('wasteTrackingId')

    const phase2Response =
      await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
        phase2Receipt
      )

    expectReceiptCreated(phase2Response)
  }

  /**
   * Submits both payloads and expects the phase 1 format error plus a phase 2 rejection.
   * @param {string} key - Phase 1 validation error key
   * @param {string} message - Phase 1 validation error message
   * @returns {Promise<void>}
   */
  async function expectBothReceiptsRejected(key, message) {
    const phase1Response =
      await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
        phase1Receipt
      )

    expect(phase1Response.statusCode).toBe(400)
    expect(phase1Response.json).toEqual({
      validation: {
        errors: [
          {
            key,
            errorType: 'InvalidFormat',
            message
          }
        ]
      }
    })

    const phase2Response =
      await globalThis.apis.wasteMovementExternalAPI.beta2.createReceiptWithoutDeliveryId(
        phase2Receipt
      )

    expectReceiptRejected(phase2Response)
  }

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

  describe('Carrier registration number', () => {
    it.each(carrierRegistrationNumbers.valid)(
      'should accept a receipt when the carrier registration number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, registrationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.carrier.registrationNumber = registrationNumber
        phase2Receipt.carrier.registrationNumber = registrationNumber

        await expectBothReceiptsAccepted()
      }
    )

    it.each(carrierRegistrationNumbers.invalid)(
      'should reject a receipt when the carrier registration number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, registrationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.carrier.registrationNumber = registrationNumber
        phase2Receipt.carrier.registrationNumber = registrationNumber

        await expectBothReceiptsRejected(
          'carrier.registrationNumber',
          registrationNumberError
        )
      }
    )
  })

  describe('Receiver authorisation number', () => {
    it.each(authorisationNumbers.valid)(
      'should accept a receipt when the receiver authorisation number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, authorisationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receiver.authorisationNumber = authorisationNumber
        phase2Receipt.receiver.authorisationNumber = authorisationNumber

        await expectBothReceiptsAccepted()
      }
    )

    it.each(authorisationNumbers.invalid)(
      'should reject a receipt when the receiver authorisation number is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, authorisationNumber) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receiver.authorisationNumber = authorisationNumber
        phase2Receipt.receiver.authorisationNumber = authorisationNumber

        await expectBothReceiptsRejected(
          'receiver.authorisationNumber',
          authorisationNumberError
        )
      }
    )
  })

  describe('Receipt postcode', () => {
    it.each(postcodes.valid)(
      'should accept a receipt when the postcode is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, postcode) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receipt.address.postcode = postcode
        phase2Receipt.receiver.receiptAddress.postcode = postcode

        await expectBothReceiptsAccepted()
      }
    )

    it.each(postcodes.invalid)(
      'should reject a receipt when the postcode is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, postcode) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receipt.address.postcode = postcode
        phase2Receipt.receiver.receiptAddress.postcode = postcode

        await expectBothReceiptsRejected(
          'receipt.address.postcode',
          postcodeError
        )
      }
    )
  })

  describe('Consignment code', () => {
    it.each(consignmentCodes.valid)(
      'should accept a receipt when the consignment code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        useConsignmentCode(code)

        await expectBothReceiptsAccepted()
      }
    )

    it.each(consignmentCodes.invalid)(
      'should reject a receipt when the consignment code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        useConsignmentCode(code)

        await expectBothReceiptsRejected(
          'hazardousWasteConsignmentCode',
          consignmentCodeError
        )
      }
    )
  })

  describe('EWC code', () => {
    it.each(ewcCodes.valid)(
      'should accept a receipt when the EWC code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.wasteItems[0].ewcCodes = [code]
        phase2Receipt.wasteItems[0].classification.ewcCodes = [code]

        await expectBothReceiptsAccepted()
      }
    )

    it.each(ewcCodes.invalid)(
      'should reject a receipt when the EWC code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.wasteItems[0].ewcCodes = [code]
        phase2Receipt.wasteItems[0].classification.ewcCodes = [code]

        await expectBothReceiptsRejected(
          'wasteItems.0.ewcCodes.0',
          ewcCodeError
        )
      }
    )
  })
})
