import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Retrieve Waste Container Types', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-721', 'DWT-721', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Retrieve Container Types list', () => {
    describe('Get Waste Container Types list', () => {
      it('should be able to retrieve valid container types list @allure.label.tag:DWT-721', async () => {
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
      })
    })
  })
})
