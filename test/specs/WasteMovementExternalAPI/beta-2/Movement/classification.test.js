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
      movementData.wasteItems[0].classification.ewcCodes =
        beta2.mirrorEwcCodes()

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
      movementData.consignmentNote = beta2.consignmentNoteWithReason()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a movement when classification is missing all required fields @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      const classification = beta2.classification()
      delete classification.wasteDescription
      delete classification.ewcCodes
      delete classification.pops
      delete classification.hazardous
      movementData.wasteItems[0].classification = classification

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
      movementData.wasteItems[0].classification.ewcCodes =
        beta2.ewcCodesBeyondMaximum()

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

    it('should reject a movement when both a consignment code and a reason are given @allure.label.tag:DWTC-224', async () => {
      await addAllureLink('/DWTC-224', 'DWTC-224', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = {
        ...beta2.consignmentNote(),
        ...beta2.consignmentNoteWithReason()
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
