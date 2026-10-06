import { describe, it, beforeEach } from '@jest/globals'
import { beta2 } from '~/test/support/test-data-manager.js'
import { authenticateAndSetToken } from '~/test/support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'
import { expectMovementCreated } from '~/test/support/helpers/beta-2-movement.js'

describe('Beta-2 Movement Creation - All fields', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Successful Creation', () => {
    it.each([
      ['Household', beta2.generateBaseMovementData],
      ['Commercial', beta2.generateBaseCommercialMovementData],
      ['Municipal', beta2.generateBaseMunicipalMovementData]
    ])(
      'should create a movement when a %s producer, a broker or dealer, supporting references and special handling requirements are all declared @allure.label.tag:DWTC-192 @allure.label.tag:DWTC-197 @allure.label.tag:DWTC-156 @allure.label.tag:DWTC-157',
      async (wasteSource, generateMovementData) => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        await addAllureLink('/DWTC-197', 'DWTC-197', 'jira')
        await addAllureLink('/DWTC-156', 'DWTC-156', 'jira')
        await addAllureLink('/DWTC-157', 'DWTC-157', 'jira')
        const movementData = generateMovementData()
        const broker = beta2.generateBaseBrokerOrDealer()
        broker.address = beta2.generateBrokerAddress()

        if (wasteSource === 'Commercial') {
          movementData.producer.address.fullAddress =
            beta2.commercialFullAddress
          movementData.producer.contactDetails.phoneNumber = beta2.phoneNumber
        }

        if (wasteSource === 'Municipal') {
          movementData.producer.sicCode = beta2.sicCode
          movementData.producer.address.fullAddress =
            beta2.municipalFullAddress
          movementData.producer.contactDetails.phoneNumber = beta2.phoneNumber
        }

        movementData.brokerOrDealer = { isPresent: true, items: [broker] }
        movementData.supportingReferences = beta2.generateSupportingReferences()
        movementData.specialHandlingRequirements =
          beta2.specialHandlingRequirements

        const response =
          await globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(
            movementData
          )

        expectMovementCreated(response)
      }
    )
  })
})
