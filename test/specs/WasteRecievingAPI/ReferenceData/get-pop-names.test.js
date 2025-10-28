import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Retrieve Pop names', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-720', 'DWT-720', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Get Pop names list', () => {
    it('should be able to retrieve valid pop names list @allure.label.tag:DWT-720', async () => {
      const expectedCodes = [
        'END',
        'HCBD',
        'PCNS',
        'SCCPS',
        'TETRABDE',
        'PENTABDE',
        'HEXABDE',
        'HEPTABDE',
        'DECABDE',
        'PBDES',
        'PFOS',
        'PCDD_PCDF',
        'DDT',
        'CHL',
        'HCH',
        'DLD',
        'ENDN',
        'HPT',
        'HCB',
        'CLD',
        'ALD',
        'PECBZ',
        'PCB',
        'MRX',
        'TOX',
        'HBB',
        'HBCD',
        'PCP',
        'PFOA',
        'DCF',
        'PFHXS'
      ]
      const response =
        await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
          'pop-names'
        )
      expect(response.statusCode).toBe(200)
      const codes = response.json.map((item) => item.code)
      expect(codes).toEqual(expectedCodes)
    })
  })
})
