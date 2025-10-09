import { describe, it, expect, beforeEach } from '@jest/globals'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Broker or Dealer Details Validation', () => {
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
        expect(response.json.length).toBeGreaterThan(0) // to improve once DWT-830 is completed
        expect(response.json).toContainEqual({
          code: '010304',
          isHazardous: true
        })
      })
    })
  })
})
