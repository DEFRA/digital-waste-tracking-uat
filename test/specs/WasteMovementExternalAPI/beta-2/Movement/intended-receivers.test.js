import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2/movement.js'

describe('Beta-2 Movement Creation - Intended receivers', () => {
  let movementData

  beforeEach(async () => {
    movementData = beta2.generateBaseMovementData()
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when an intended receiver with valid details is declared @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one intended receiver is declared @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      const receiver = beta2.intendedReceiver()
      receiver.receiptAddress = beta2.intendedReceiverReceiptAddress()
      movementData.intendedReceivers = [
        receiver,
        beta2.secondIntendedReceiver()
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a movement when no intended receiver is declared @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      delete movementData.intendedReceivers

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when any one of several intended receivers has missing details @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      const invalidReceiver = beta2.secondIntendedReceiver()
      delete invalidReceiver.siteName
      movementData.intendedReceivers = [
        beta2.intendedReceiver(),
        invalidReceiver
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
