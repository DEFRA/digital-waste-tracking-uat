import { randomUUID } from 'crypto'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

describe('Beta-2 Movement Creation - API Code', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Problem Responses', () => {
    it(
      'should reject creating a movement when apiCode is sent in the body' +
        ' @allure.label.tag:DWTC-246',
      async () => {
        await addAllureLink('/DWTC-246', 'DWTC-246', 'jira')
        movementData.apiCode = globalThis.testConfig.apiCode

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: beta2.badRequestType,
          title: 'Bad Request',
          detail: '1 validation error occurred',
          instance: '/beta-2/movements',
          requestId: response.headers['x-request-id'],
          errors: [
            {
              message: 'must NOT have additional properties',
              pointer: '/apiCode',
              errorType: 'NotAllowed'
            }
          ]
        })
      }
    )

    it(
      'should reject creating a movement when the x-api-code header is missing' +
        ' @allure.label.tag:DWTC-246',
      async () => {
        await addAllureLink('/DWTC-246', 'DWTC-246', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData,
            null
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: beta2.badRequestType,
          title: 'Bad Request',
          detail: 'the API Code supplied is invalid',
          instance: '/beta-2/movements',
          requestId: response.headers['x-request-id']
        })
      }
    )

    it(
      'should reject creating a movement when the API code is not recognised' +
        ' @allure.label.tag:DWTC-246',
      async () => {
        await addAllureLink('/DWTC-246', 'DWTC-246', 'jira')

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData,
            randomUUID()
          )

        expect(response.statusCode).toBe(400)
        expect(response.headers['content-type']).toContain(
          'application/problem+json'
        )
        expect(response.headers['x-request-id']).toEqual(expect.any(String))
        expect(response.json).toEqual({
          type: beta2.badRequestType,
          title: 'Bad Request',
          detail: 'the API Code supplied is invalid',
          instance: '/beta-2/movements',
          requestId: response.headers['x-request-id']
        })
      }
    )
  })
})
