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
      movementData.intendedReceivers[0].receiptAddress.fullAddress =
        beta2.intendedReceiverFullAddress()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one intended receiver is declared @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers = [
        beta2.intendedReceiver(),
        beta2.secondIntendedReceiver()
      ]

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when an intended receiver is declared with only an email address @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].contactDetails = {
        emailAddress: 'receiver@example.com'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when an intended receiver is declared with only a phone number @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].contactDetails = {
        phoneNumber: '01234567890'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject an intended receiver when the site name is missing @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      delete movementData.intendedReceivers[0].siteName

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when the authorisation number is missing @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      delete movementData.intendedReceivers[0].authorisationNumber

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when the receipt address is missing @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      delete movementData.intendedReceivers[0].receiptAddress

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when neither an email address nor a phone number is given @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].contactDetails = {}

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when the authorisation number is invalid @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].authorisationNumber = 'INVALID'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when the receipt address postcode is invalid @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].receiptAddress.postcode = 'INVALID'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when the email address is invalid @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].contactDetails = {
        emailAddress: 'not-an-email'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject an intended receiver when the phone number is invalid @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      movementData.intendedReceivers[0].contactDetails = {
        phoneNumber: 'abc'
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when any one of several intended receivers has missing or invalid details @allure.label.tag:DWTC-198', async () => {
      await addAllureLink('/DWTC-198', 'DWTC-198', 'jira')
      const invalidReceiver = beta2.secondIntendedReceiver()
      delete invalidReceiver.siteName
      invalidReceiver.receiptAddress.postcode = 'INVALID'
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
