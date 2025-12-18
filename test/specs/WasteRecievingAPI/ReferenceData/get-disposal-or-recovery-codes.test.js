import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Retrieve Disposal or Recovery Codes', () => {
  beforeEach(async () => {
    await addAllureLink('/DWT-719', 'DWT-719', 'jira')
    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Retrieve Disposal or Recovery Codes list', () => {
    describe('Get Disposal or Recovery codes list', () => {
      it('should be able to retrieve valid Disposal or Recovery codes list @allure.label.tag:DWT-719', async () => {
        const dCodes = [...Array(15).keys()].map((index) => `D${index + 1}`)
        const rCodes = [...Array(13).keys()].map((index) => `R${index + 1}`)
        const expectedCodes = [...rCodes, ...dCodes]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.retrieveReferenceData(
            'disposal-or-recovery-codes'
          )
        expect(response.statusCode).toBe(200)
        const codes = response.json.map((item) => item.code)
        expect(codes).toEqual(expectedCodes)
        // DWT-1292 -adding addtional assertion to verify the structure of the object
        const rCodeObj = response.json.find((item) => item.code === 'R12')
        expect(rCodeObj).toEqual({
          code: 'R12',
          isNotRecoveryToFinalProduct: true,
          description:
            'Exchange of wastes for submission to any of the operations numbered R1 to R11'
        })
      })
    })
  })
})
