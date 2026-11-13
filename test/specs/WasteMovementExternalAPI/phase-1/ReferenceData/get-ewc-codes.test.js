import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../../support/helpers/auth.js'
import { addAllureLink } from '../../../../support/helpers/allure-api-logger.js'

describe('@smoke - Retrieve EWC Codes', () => {
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
      expect(response.json.length).toEqual(884)

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

    it(
      'should return the EWC codes the EU added from 9 December 2026, hazardous or not, with a blank entry type' +
        ' @allure.label.tag:DWTC-264',
      async () => {
        await addAllureLink('/DWTC-264', 'DWTC-264', 'jira')
        const response =
          await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
            'ewc-codes'
          )
        expect(response.statusCode).toBe(200)

        const hazardousCode = response.json.find(
          (item) => item.code === '160607'
        )
        expect(hazardousCode).toEqual({
          code: '160607',
          isHazardous: true,
          entryTypeDesc: '',
          chapter: 'Wastes not otherwise specified in the list',
          subChapter:
            'Wastes from the manufacture, supply and use of batteries',
          description: 'Waste lithium-based batteries'
        })

        const nonHazardousCode = response.json.find(
          (item) => item.code === '160612'
        )
        expect(nonHazardousCode).toEqual({
          code: '160612',
          isHazardous: false,
          entryTypeDesc: '',
          chapter: 'Wastes not otherwise specified in the list',
          subChapter:
            'Wastes from the manufacture, supply and use of batteries',
          description:
            'Other waste sodium-based batteries (except 16 06 10 and 16 06 11)'
        })
      }
    )
  })
})
