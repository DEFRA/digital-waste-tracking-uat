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

  describe('EWC code', () => {
    it.each(ewcCodes.valid)(
      'should accept a receipt when the EWC code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.wasteItems[0].ewcCodes = [code]
        phase2Receipt.wasteItems[0].classification.ewcCodes = [code]

        await expectBothReceiptsAccepted(phase1Receipt, phase2Receipt)
      }
    )

    it.each(ewcCodes.invalid)(
      'should reject a receipt when the EWC code is %s (%s) @allure.label.tag:DWTC-370',
      async (_label, code) => {
        await addAllureLink('/DWTC-370', 'DWTC-370', 'jira')
        phase1Receipt.wasteItems[0].ewcCodes = [code]
        phase2Receipt.wasteItems[0].classification.ewcCodes = [code]

        await expectBothReceiptsRejected(phase1Receipt, phase2Receipt)
      }
    )
  })
})
