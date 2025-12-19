import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Retrieve EWC Codes', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-717', 'DWT-717', 'jira')
    await addAllureLink('/DWT-1285', 'DWT-1285', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Get EWC Codes List', () => {
    it('should return the full list of EWC codes with all required fields @allure.label.tag:DWT-717 @allure.label.tag:DWT-1285', async () => {
      const response =
        await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
          'ewc-codes'
        )
      expect(response.statusCode).toBe(200)
      expect(response.json.length).toEqual(842)

      const nonHazardousCode = response.json.find(
        (item) => item.code === '200138'
      )
      expect(nonHazardousCode).toEqual({
        code: '200138',
        isHazardous: false,
        entryTypeDesc: 'Mirror non-hazardous',
        chapter:
          'Municipal wastes (household waste and similar commercial, industrial and institutional wastes) including separately collected fractions',
        subChapter: 'Separately collected fractions (except 15 01)',
        description: 'Wood other than that mentioned in 20 01 37'
      })
    })
  })
})
