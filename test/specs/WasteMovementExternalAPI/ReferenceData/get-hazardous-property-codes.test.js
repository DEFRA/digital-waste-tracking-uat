import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('@smoke - Retrieve Hazardous Property Codes', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-718', 'DWT-718', 'jira')
    await addAllureLink('/DWT-1293', 'DWT-1293', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Retrieve Hazardous Property Codes list', () => {
    describe('Get Hazardous Property codes list', () => {
      it('should be able to retrieve valid hazardous property codes list @allure.label.tag:DWT-718 @allure.label.tag:DWT-1293', async () => {
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
        const codes = response.json.map((item) => item.code)
        expect(codes).toEqual(expectedCodes)
        // DWT-1293 -adding addtional assertion to verify the structure of the object
        const codeObj = response.json.find((item) => item.code === 'HP_15')
        expect(codeObj).toEqual({
          code: 'HP_15',
          shortDesc:
            '(capable of exhibiting a hazardous property HP 1 - HP 14, not directly displayed by the original waste)',
          longDesc:
            'Waste that could show any of the hazardous properties HP 1 - HP 14, even if not originally present.'
        })
      })
    })
  })
})
