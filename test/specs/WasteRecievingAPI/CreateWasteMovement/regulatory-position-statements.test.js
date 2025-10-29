import { describe, it, expect, beforeEach } from '@jest/globals'
import { generateBaseWasteReceiptData } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '../../../support/helpers/allure-api-logger.js'

describe('Regulatory Position Statements Validation', () => {
  let wasteReceiptData

  beforeEach(async () => {
    await addAllureLink('/DWT-345', 'DWT-345', 'jira')
    wasteReceiptData = generateBaseWasteReceiptData()

    // Authenticate and set the auth token
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Valid Regulatory Position Statements', () => {
    it(
      'should accept waste movement with empty regulatory position statements array' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = []
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept waste movement with single regulatory position statement' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = [123]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )

    it(
      'should accept waste movement with multiple regulatory position statements' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = [
          123, 1, 123456
        ]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(201)
        expect(response.json).toHaveProperty('wasteTrackingId')
      }
    )
  })

  describe('Invalid Regulatory Position Statements', () => {
    it(
      'should reject waste movement when regulatory position statements contains a negative number' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = [-1, 2, 3]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.regulatoryPositionStatements.0',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.regulatoryPositionStatements[0]" must be a positive number'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement when regulatory position statements contains a zero' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = [0, 1, 2, 3]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.regulatoryPositionStatements.0',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.regulatoryPositionStatements[0]" must be a positive number'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement when regulatory position statements contains a string' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = [
          123,
          'RPS456',
          789
        ]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.regulatoryPositionStatements.1',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.regulatoryPositionStatements[1]" must be a number'
              }
            ]
          }
        })
      }
    )

    it(
      'should reject waste movement when regulatory position statements contains a decimal number' +
        ' @allure.label.tag:DWT-345',
      async () => {
        wasteReceiptData.receiver.regulatoryPositionStatements = [
          123, 456.78, 910
        ]
        const response =
          await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
            wasteReceiptData
          )
        expect(response.statusCode).toBe(400)
        expect(response.json).toEqual({
          validation: {
            errors: [
              {
                key: 'receiver.regulatoryPositionStatements.1',
                errorType: 'UnexpectedError',
                message:
                  '"receiver.regulatoryPositionStatements[1]" must be an integer'
              }
            ]
          }
        })
      }
    )
  })
})
