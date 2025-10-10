import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Retrieve Hazardous Property Codes', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-718', 'DWT-718', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Retrieve Hazardous Property Codes list', () => {
    describe('Get Hazardous Property codes list', () => {
      it('should be able to retrieve valid hazardous property codes list @allure.label.tag:DWT-718', async () => {
        const expectedCodes = [
          'HP_1',
          'HP_2',
          'HP_3',
          'HP_4',
          'HP_5',
          'HP_6',
          'HP_7',
          'HP_8',
          'HP_9',
          'HP_10',
          'HP_11',
          'HP_12',
          'HP_13',
          'HP_14',
          'HP_15',
          'HP_POP'
        ]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
            'hazardous-property-codes'
          )
        expect(response.statusCode).toBe(200)
        expect(response.json.length).toBe(16)
        expect(response.json).toContainEqual({
          code: 'HP_1'
        })
        const codes = response.json.map((item) => item.code)
        expect(codes).toEqual(expectedCodes)
      })
    })
  })
})
