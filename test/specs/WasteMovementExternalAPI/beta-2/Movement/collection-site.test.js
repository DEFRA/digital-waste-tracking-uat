import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Collection site', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when a valid planned collection date and time, address and contact details are given @allure.label.tag:DWTC-200', async () => {
      await addAllureLink('/DWTC-200', 'DWTC-200', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    // Required fields removed for required-field error assertions
    it('should reject a movement when collection details are missing all required fields @allure.label.tag:DWTC-200', async () => {
      await addAllureLink('/DWTC-200', 'DWTC-200', 'jira')
      delete movementData.plannedCollectionDateTime
      const collectionSite = beta2.collectionSite()
      delete collectionSite.address
      delete collectionSite.contactDetails
      movementData.collectionSite = collectionSite

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
