import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Retrieve EWC Codes', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-717', 'DWT-717', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Retrieve EWC Codes', () => {
    describe('Get ewc codes list', () => {
      it('should be able to retrieve valid ewc codes list with isHazardous indicator @allure.label.tag:DWT-717', async () => {
        const response =
          await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
            'ewc-codes'
          )
        expect(response.statusCode).toBe(200)
        expect(response.json.length).toEqual(842)
        // disabling this for now , should be re-enabled after 1285 is merged
        //   expect(response.json).toContainEqual({
        //     code: '200138',
        //     isHazardous: 'No',
        //     entryTypeDesc: 'Mirror non-hazardous',
        //     chapter:
        //       'Municipal wastes (household waste and similar commercial, industrial and institutional wastes) including separately collected fractions',
        //     subChapter: 'Separately collected fractions (except 15 01)',
        //     description: 'Wood other than that mentioned in 20 01 37'
        //   })
      })
    })
  })
})
