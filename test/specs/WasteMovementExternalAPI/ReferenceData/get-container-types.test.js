import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

/**
 * Test suite for retrieving waste container types reference data
 * @fileoverview Tests the container types API endpoint functionality
 */
describe('@smoke - Retrieve Waste Container Types', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-721', 'DWT-721', 'jira')
    await addAllureLink('/DWT-1287', 'DWT-1287', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Get Waste Container Types list', () => {
    it('should be able to retrieve valid container types list @allure.label.tag:DWT-721 @allure.label.tag:DWT-1287', async () => {
      const expectedCodes = [
        'BAG',
        'BAL',
        'BOX',
        'CAN',
        'CAR',
        'CAS',
        'CON',
        'DRU',
        'FIB',
        'IBC',
        'LOO',
        'PAL',
        'ROR',
        'SKI',
        'TAN',
        'WBI'
      ]
      const response =
        await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
          'container-types'
        )
      expect(response.statusCode).toBe(200)
      const codes = response.json.map((item) => item.code)
      expect(codes).toEqual(expectedCodes)
      // DWT-1287 -adding addtional assertion to verify the structure of the object
      const codeObj = response.json.find((item) => item.code === 'BOX')
      expect(codeObj).toEqual({
        code: 'BOX',
        description: 'Box / Carton / Crate'
      })
    })
  })
})
