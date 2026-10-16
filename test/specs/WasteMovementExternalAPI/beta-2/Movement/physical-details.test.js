import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Physical Details', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when a valid physical form, containers and weight are declared @allure.label.tag:DWTC-184', async () => {
      await addAllureLink('/DWTC-184', 'DWTC-184', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when the waste is loose and no containers are used @allure.label.tag:DWTC-184', async () => {
      await addAllureLink('/DWTC-184', 'DWTC-184', 'jira')
      movementData.wasteItems[0].physicalDetails.containerType = 'LOO'
      movementData.wasteItems[0].physicalDetails.containerCount = 0

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a movement when a loose container type is declared with more than 0 containers @allure.label.tag:DWTC-184', async () => {
      await addAllureLink('/DWTC-184', 'DWTC-184', 'jira')
      movementData.wasteItems[0].physicalDetails.containerType = 'LOO'
      movementData.wasteItems[0].physicalDetails.containerCount = 1

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    // Required fields removed for required-field error assertions
    it('should reject a movement when physical details are missing all required fields @allure.label.tag:DWTC-184', async () => {
      await addAllureLink('/DWTC-184', 'DWTC-184', 'jira')
      const physicalDetails = beta2.physicalDetails()
      delete physicalDetails.form
      delete physicalDetails.containerType
      delete physicalDetails.containerCount
      delete physicalDetails.totalWeight
      movementData.wasteItems[0].physicalDetails = physicalDetails

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
