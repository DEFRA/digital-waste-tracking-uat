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

    it('should create a movement when the waste is declared with recognised hazardous properties and a component @allure.label.tag:DWTC-222', async () => {
      await addAllureLink('/DWTC-222', 'DWTC-222', 'jira')
      await addAllureLink('/DWTC-247', 'DWTC-247', 'jira')
      movementData.wasteItems[0].classification =
        beta2.hazardousClassification()
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when more than one hazardous component is declared @allure.label.tag:DWTC-247', async () => {
      await addAllureLink('/DWTC-247', 'DWTC-247', 'jira')
      movementData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousPresent(),
        components: [
          beta2.hazardousComponentWithAmount(),
          beta2.hazardousComponentWithThreshold()
        ]
      }
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementCreated(response)
    })

    it('should create a movement when hazardous components are declared as not applicable @allure.label.tag:DWTC-247', async () => {
      await addAllureLink('/DWTC-247', 'DWTC-247', 'jira')
      movementData.wasteItems[0].classification.hazardous =
        beta2.hazardousComponentsNotApplicable()
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
      await addAllureLink('/DWTC-247', 'DWTC-247', 'jira')
      const hazardous = beta2.hazardousPresent()
      delete hazardous.codes
      delete hazardous.componentsSource
      delete hazardous.componentsNotApplicable
      delete hazardous.components
      movementData.wasteItems[0].classification.hazardous = hazardous
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when hazardous details are given for waste declared as not hazardous @allure.label.tag:DWTC-222', async () => {
      await addAllureLink('/DWTC-222', 'DWTC-222', 'jira')
      await addAllureLink('/DWTC-247', 'DWTC-247', 'jira')
      const present = beta2.hazardousPresent()
      movementData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousNotPresent(),
        codes: present.codes,
        componentsSource: present.componentsSource,
        componentsNotApplicable: present.componentsNotApplicable,
        components: present.components
      }

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when hazardous components are given although declared not applicable @allure.label.tag:DWTC-247', async () => {
      await addAllureLink('/DWTC-247', 'DWTC-247', 'jira')
      movementData.wasteItems[0].classification.hazardous = {
        ...beta2.hazardousComponentsNotApplicable(),
        components: [beta2.hazardousComponentWithAmount()]
      }
      movementData.consignmentNote = beta2.consignmentNote()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          movementData
        )

      expectMovementRejected(response)
    })
  })
})
