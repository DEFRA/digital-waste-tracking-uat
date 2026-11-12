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

  describe('Receipt postcode', () => {
    it.each(postcodes.valid)(
      'should accept a receipt when the postcode is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, postcode) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receipt.address.postcode = postcode
        phase2Receipt.receiver.receiptAddress.postcode = postcode

        await expectBothReceiptsAccepted(phase1Receipt, phase2Receipt)
      }
    )

    it.each(postcodes.invalid)(
      'should reject a receipt when the postcode is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, postcode) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.receipt.address.postcode = postcode
        phase2Receipt.receiver.receiptAddress.postcode = postcode

        await expectBothReceiptsRejected(phase1Receipt, phase2Receipt)
      }
    )
  })
})
