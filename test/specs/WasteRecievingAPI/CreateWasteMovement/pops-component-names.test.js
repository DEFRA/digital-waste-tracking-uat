import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('POPs Component Names Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-346', 'DWT-346', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  it(
    'should accept waste containing an allowed POPs component name "Hexabromobiphenyl"' +
      ' @allure.label.tag:DWT-346',
    async () => {
      wasteReceiptData.wasteItems[0].pops = {
        containsPops: true,
        components: [
          {
            name: 'Hexabromobiphenyl',
            concentration: 2.5
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    }
  )

  it(
    'should accept waste containing multiple POPs component' +
      ' @allure.label.tag:DWT-346',
    async () => {
      wasteReceiptData.wasteItems[0].pops = {
        containsPops: true,
        components: [
          {
            name: 'Hexabromobiphenyl',
            concentration: 2.5
          },
          {
            name: 'Chlordane',
            concentration: 2.0
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    }
  )

  it(
    'should accept waste containing when the POP component name is an empty string' +
      ' @allure.label.tag:DWT-346',
    async () => {
      wasteReceiptData.wasteItems[0].pops = {
        containsPops: true,
        components: [
          {
            name: '',
            concentration: 2.5
          },
          {
            name: 'Chlordane',
            concentration: 2.0
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    }
  )

  it(
    'should accept waste containing when carrier cannot supply one of the POP component name' +
      ' @allure.label.tag:DWT-346',
    async () => {
      wasteReceiptData.wasteItems[0].pops = {
        containsPops: true,
        components: [
          {
            name: 'Carrier did not provide detail',
            concentration: 2.5
          },
          {
            name: 'Chlordane',
            concentration: 2.0
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(200)
      expect(response.json).toEqual({
        statusCode: 200,
        globalMovementId: expect.any(String)
      })
    }
  )

  it(
    'should reject waste submission containing POPs components when it is not required' +
      ' @allure.label.tag:DWT-346',
    async () => {
      wasteReceiptData.wasteItems[0].pops = {
        containsPops: false,
        components: [
          {
            name: 'Chlordane',
            concentration: 2.0
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.pops',
              errorType: 'UnexpectedError',
              message: 'A POP name cannot be provided when POPs are not present'
            }
          ]
        }
      })
    }
  )

  it(
    'should reject waste submission containing POPs components when given a value that is not from allowed list' +
      ' @allure.label.tag:DWT-346',
    async () => {
      wasteReceiptData.wasteItems[0].pops = {
        containsPops: true,
        components: [
          {
            name: 'ChlordaneXYZ',
            concentration: 2.0
          }
        ]
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          wasteReceiptData
        )

      expect(response.statusCode).toBe(400)
      expect(response.json).toEqual({
        validation: {
          errors: [
            {
              key: 'wasteItems.0.pops.components.0.name',
              errorType: 'UnexpectedError',
              message: 'POP name is not valid'
            }
          ]
        }
      })
    }
  )
})
