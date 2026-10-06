import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import {
  expectMovementCreated,
  expectMovementRejected
} from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - Supporting references', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it('should create a movement when one supporting reference is provided @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([
            beta2.generateSupportingReference()
          ])
        )

      expectMovementCreated(response)
    })

    it.each(beta2.supportingReferenceLabels)(
      'should create a movement when a supporting reference uses the label %s @allure.label.tag:DWTC-156',
      async (label) => {
        await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
        const supportingReference = beta2.generateSupportingReference()
        supportingReference.label = label

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            beta2.generateMovementWithSupportingReferences([
              supportingReference
            ])
          )

        expectMovementCreated(response)
      }
    )

    it('should create a movement when a supporting reference is exactly 50 characters @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.generateSupportingReference()
      supportingReference.reference = 'A'.repeat(50)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([supportingReference])
        )

      expectMovementCreated(response)
    })
  })

  describe('Problem Responses', () => {
    it('should reject a supporting reference when the label is missing @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.generateSupportingReference()
      delete supportingReference.label

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([supportingReference])
        )

      expectMovementRejected(response)
    })

    it('should reject a supporting reference when the reference is missing @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.generateSupportingReference()
      delete supportingReference.reference

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([supportingReference])
        )

      expectMovementRejected(response)
    })

    it('should reject a supporting reference when the reference is longer than 50 characters @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.generateSupportingReference()
      supportingReference.reference = 'A'.repeat(51)

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([supportingReference])
        )

      expectMovementRejected(response)
    })

    it('should reject a supporting reference when the label is not recognised @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const supportingReference = beta2.generateSupportingReference()
      supportingReference.label = 'Purchase order'

      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([supportingReference])
        )

      expectMovementRejected(response)
    })

    it('should reject a movement when supporting references are an empty list @allure.label.tag:DWTC-156', async () => {
      await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
      const response =
        await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
          beta2.generateMovementWithSupportingReferences([])
        )

      expectMovementRejected(response)
    })
  })
})
