import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Classification', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when non-hazardous waste is described without a consignment code @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a consignment code is given for non-hazardous waste @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when a mirror EWC code is provided @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification.ewcCodes = ['170504', '191212']

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when hazardous waste has a consignment code @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when hazardous waste has a reason for no consignment code @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = {
        reasonForNoCode: beta2.reasonForNoConsignmentCode
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a movement when the waste description is missing @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      delete movementData.wasteItems[0].classification.wasteDescription

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when an EWC code is not recognised @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification.ewcCodes = ['999999']

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when more than 5 EWC codes are declared @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification.ewcCodes = [
        '170504',
        '191212',
        '170904',
        '170604',
        '200101',
        '200301'
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when hazardous waste has neither a consignment code nor a reason @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when one of several wastes is hazardous and has neither a consignment code nor a reason @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems = [
        beta2.wasteItem(),
        {
          classification: beta2.hazardousClassification(),
          physicalDetails: beta2.physicalDetails()
        }
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when the consignment code is not in a recognised format @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = { code: '12345' }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when both a consignment code and a reason are given @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = {
        ...beta2.consignmentNote(),
        reasonForNoCode: beta2.reasonForNoConsignmentCode
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when one of several wastes has a missing description and an unrecognised EWC code @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      const invalidWasteItem = beta2.secondWasteItem()
      delete invalidWasteItem.classification.wasteDescription
      invalidWasteItem.classification.ewcCodes = ['999999']
      movementData.wasteItems = [beta2.wasteItem(), invalidWasteItem]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
