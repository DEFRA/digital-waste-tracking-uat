import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Hazardous properties', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when the waste is declared as not having hazardous properties @allure.label.tag:DWTC-222', async () => {
      await addAllureLink('/DWTC-222', 'DWTC-222', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when the waste is declared with recognised hazardous properties @allure.label.tag:DWTC-222', async () => {
      await addAllureLink('/DWTC-222', 'DWTC-222', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a movement when hazardous properties are missing all required fields @allure.label.tag:DWTC-222', async () => {
      await addAllureLink('/DWTC-222', 'DWTC-222', 'jira')
      const hazardous = beta2.hazardousPresent()
      delete hazardous.codes
      movementData.wasteItems[0].classification.hazardous = hazardous
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when hazardous properties are given for waste declared as not hazardous @allure.label.tag:DWTC-222', async () => {
      await addAllureLink('/DWTC-222', 'DWTC-222', 'jira')
      movementData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousNotPresent(),
        codes: beta2.hazardousPresent().codes
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
