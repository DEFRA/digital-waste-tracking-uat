import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('@smoke - API Code Lifecycle', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-1493', 'DWT-1493', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Create API code and successful waste movement', () => {
    it('should create a new API code for an organisation and successfully make a waste movement @allure.label.tag:DWT-1493', async () => {
      const organisationId = randomUUID()
      const createCodeResponse =
        await globalThis.apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
          organisationId
        )

      expect(createCodeResponse.statusCode).toBe(200)
      expect(createCodeResponse.json).toMatchObject({
        code: expect.any(String),
        name: expect.any(String),
        isDisabled: false
      })

      const apiCode = createCodeResponse.json.code
      wasteReceiptData.apiCode = apiCode

      const movementResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(movementResponse.statusCode).toBe(201)
      expect(movementResponse.json).toEqual({
        wasteTrackingId: expect.any(String)
      })
    })
  })

  describe('Disabled API code rejects waste movement', () => {
    it('should reject waste movement when API code is created then disabled @allure.label.tag:DWT-1493', async () => {
      const organisationId = randomUUID()
      const createCodeResponse =
        await globalThis.apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
          organisationId
        )

      expect(createCodeResponse.statusCode).toBe(200)
      expect(createCodeResponse.json).toMatchObject({
        code: expect.any(String),
        name: expect.any(String),
        isDisabled: false
      })

      const apiCode = createCodeResponse.json.code

      const disableResponse =
        await globalThis.apis.wasteOrganisationBackendAPI.disableApiCodeForOrganisation(
          organisationId,
          apiCode
        )

      expect(disableResponse.statusCode).toBe(200)
      expect(disableResponse.json).toMatchObject({
        code: apiCode,
        name: expect.any(String),
        isDisabled: true
      })

      wasteReceiptData.apiCode = apiCode

      const movementResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(movementResponse.statusCode).toBe(400)
      expect(movementResponse.json).toHaveProperty('validation')
      expect(movementResponse.json.validation).toHaveProperty('errors')
      const apiCodeError = movementResponse.json.validation.errors.find(
        (e) => e.key === 'apiCode'
      )
      expect(apiCodeError).toBeDefined()
      expect(apiCodeError.errorType).toBeDefined()
      expect(apiCodeError.message).toBeDefined()
    })
  })

  describe('Non-existing API code rejects waste movement', () => {
    it('should reject waste movement when a non-existing API code is used @allure.label.tag:DWT-1493', async () => {
      const nonExistingApiCode = randomUUID()
      wasteReceiptData.apiCode = nonExistingApiCode

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'apiCode',
              errorType: 'InvalidValue',
              message: 'the API Code supplied is invalid'
            }
          ]
        }
      })
    })
  })
})
