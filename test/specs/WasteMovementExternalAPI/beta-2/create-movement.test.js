import { describe, it, expect, beforeEach } from '@jest/globals'
import { beta2 } from '../../../support/test-data-manager.js'
import { authenticateAndSetToken } from '../../../support/helpers/auth.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

const badRequestType =
  'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request'

const sicCodeFormatMessage = 'must match pattern "^\\d{5}$"'
const postcodeFormatMessage =
  'must match pattern "^\\s*(?:(?:(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z]\\d{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y]\\d{1,2})|(([A-Za-z]\\d[A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y]\\d?[A-Za-z])))) \\d[A-Za-z]{2})))|(?:(?:[Dd]6[Ww]|[AaC-Fc-fHhKkNnPpRrTtV-Yv-y]\\d{2}) ?[0-9AaC-Fc-fHhKkNnPpRrTtV-Yv-y]{4}))\\s*$"'
const phoneFormatMessage =
  'must match pattern "^\\s*(?=(?:\\D*\\d){7,15}\\D*$)\\+?[0-9()\\-\\s]+$"'
const emailFormatMessage = 'must match format "email"'

const commercialOrMunicipal = [
  ['Commercial', () => beta2.generateCommercialMovementData()],
  ['Municipal', () => beta2.generateMunicipalMovementData()]
]

const expectMovementCreated = (response) => {
  expect(response.statusCode).toBe(201)
  expect(response.json).toEqual({
    data: {
      movementId: expect.any(String)
    },
    validation: {
      warnings: []
    }
  })
}

const expectMovementRejected = (response, errorCount, errors) => {
  expect(response.statusCode).toBe(400)
  expect(response.headers['content-type']).toContain('application/problem+json')
  expect(response.headers['x-request-id']).toEqual(expect.any(String))
  expect(response.json).toEqual({
    type: badRequestType,
    title: 'Bad Request',
    detail: `${errorCount} validation error${errorCount === 1 ? '' : 's'} occurred`,
    instance: '/beta-2/movements',
    requestId: response.headers['x-request-id'],
    errors: expect.arrayContaining(errors)
  })
}

const createMovement = (movementData) =>
  globalThis.apis.wasteMovementExternalAPI.beta2.createMovement(movementData)

describe('Beta-2 Movement Creation', () => {
  beforeEach(async () => {
    await authenticateAndSetToken(
      globalThis.testConfig.cognitoClientId,
      globalThis.testConfig.cognitoClientSecret
    )
  })

  describe('Producer', () => {
    describe('Successful Creation', () => {
      it('should create a movement when a Household producer declares only the waste source @allure.label.tag:DWTC-192', async () => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const response = await createMovement(
          beta2.generateHouseholdMovementData()
        )

        expectMovementCreated(response)
      })

      it.each(commercialOrMunicipal)(
        'should create a movement when a %s producer declares an authorisation number and contact details @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const response = await createMovement(generateMovementData())

          expectMovementCreated(response)
        }
      )

      it.each(commercialOrMunicipal)(
        'should create a movement when a %s producer gives a reason instead of an authorisation number @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          delete movementData.producer.authorisationNumber
          movementData.producer.reasonForNoAuthorisationNumber =
            'Exemption pending renewal'

          const response = await createMovement(movementData)

          expectMovementCreated(response)
        }
      )

      it('should create a movement when a Municipal producer omits the SIC code @allure.label.tag:DWTC-192', async () => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateMunicipalMovementData()
        delete movementData.producer.sicCode

        const response = await createMovement(movementData)

        expectMovementCreated(response)
      })
    })

    describe('Problem Responses', () => {
      it.each(commercialOrMunicipal)(
        'should reject a %s producer when the organisation name is missing @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          delete movementData.producer.organisationName

          const response = await createMovement(movementData)

          expectMovementRejected(response, 13, [
            {
              message: '"organisationName" is required',
              pointer: '/producer/organisationName',
              errorType: 'NotProvided'
            }
          ])
        }
      )

      it('should reject a Commercial producer when the SIC code is missing @allure.label.tag:DWTC-192', async () => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateCommercialMovementData()
        delete movementData.producer.sicCode

        const response = await createMovement(movementData)

        expectMovementRejected(response, 12, [
          {
            message: '"sicCode" is required',
            pointer: '/producer/sicCode',
            errorType: 'NotProvided'
          }
        ])
      })

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when the address is missing @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          delete movementData.producer.address

          const response = await createMovement(movementData)

          expectMovementRejected(response, 13, [
            {
              message: '"address" is required',
              pointer: '/producer/address',
              errorType: 'NotProvided'
            }
          ])
        }
      )

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when neither an authorisation number nor a reason is given @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          delete movementData.producer.authorisationNumber

          const response = await createMovement(movementData)

          expectMovementRejected(response, 17, [
            {
              message: '"authorisationNumber" is required',
              pointer: '/producer/authorisationNumber',
              errorType: 'NotProvided'
            },
            {
              message: '"reasonForNoAuthorisationNumber" is required',
              pointer: '/producer/reasonForNoAuthorisationNumber',
              errorType: 'NotProvided'
            }
          ])
        }
      )

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when both an authorisation number and a reason are given @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          movementData.producer.reasonForNoAuthorisationNumber =
            'Exemption pending renewal'

          const response = await createMovement(movementData)

          expectMovementRejected(response, 21, [
            {
              message: 'boolean schema is false',
              pointer: '/producer/authorisationNumber',
              errorType: 'NotAllowed'
            },
            {
              message: 'boolean schema is false',
              pointer: '/producer/reasonForNoAuthorisationNumber',
              errorType: 'NotAllowed'
            }
          ])
        }
      )

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when neither an email address nor a phone number is given @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          movementData.producer.contactDetails = {}

          const response = await createMovement(movementData)

          expectMovementRejected(response, 19, [
            {
              message: '"emailAddress" is required',
              pointer: '/producer/contactDetails/emailAddress',
              errorType: 'NotProvided'
            },
            {
              message: '"phoneNumber" is required',
              pointer: '/producer/contactDetails/phoneNumber',
              errorType: 'NotProvided'
            }
          ])
        }
      )

      it('should reject a Household producer when organisation, address, SIC code, authorisation number or contact details are supplied @allure.label.tag:DWTC-192', async () => {
        await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
        const movementData = beta2.generateHouseholdMovementData()
        movementData.producer.organisationName = 'Acme'
        movementData.producer.sicCode = '38110'
        movementData.producer.authorisationNumber = 'EAS/P/123456'
        movementData.producer.address = {
          fullAddress: '10 Industrial Way, Test City',
          postcode: 'TE1 2PQ'
        }
        movementData.producer.contactDetails = {
          emailAddress: 'producer@example.com'
        }

        const response = await createMovement(movementData)

        expectMovementRejected(response, 13, [
          {
            message: 'property name must be valid',
            pointer: '/producer',
            errorType: 'NotAllowed'
          }
        ])
        expect(
          response.json.errors.filter(
            (error) => error.message === 'property name must be valid'
          )
        ).toHaveLength(5)
      })

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when the SIC code is not five digits @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          movementData.producer.sicCode = '123'

          const response = await createMovement(movementData)

          expectMovementRejected(response, 15, [
            {
              message: sicCodeFormatMessage,
              pointer: '/producer/sicCode',
              errorType: 'InvalidFormat'
            }
          ])
        }
      )

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when the postcode is not a UK postcode or Irish Eircode @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          movementData.producer.address.postcode = 'ZZ'

          const response = await createMovement(movementData)

          expectMovementRejected(response, 15, [
            {
              message: postcodeFormatMessage,
              pointer: '/producer/address/postcode',
              errorType: 'InvalidFormat'
            }
          ])
        }
      )

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when the phone number is invalid @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          movementData.producer.contactDetails = {
            phoneNumber: 'not-a-phone-number'
          }

          const response = await createMovement(movementData)

          expectMovementRejected(response, 15, [
            {
              message: phoneFormatMessage,
              pointer: '/producer/contactDetails/phoneNumber',
              errorType: 'InvalidFormat'
            }
          ])
        }
      )

      it.each(commercialOrMunicipal)(
        'should reject a %s producer when the email address is invalid @allure.label.tag:DWTC-192',
        async (_wasteSource, generateMovementData) => {
          await addAllureLink('/DWTC-192', 'DWTC-192', 'jira')
          const movementData = generateMovementData()
          movementData.producer.contactDetails = {
            emailAddress: 'not-an-email-address'
          }

          const response = await createMovement(movementData)

          expectMovementRejected(response, 15, [
            {
              message: emailFormatMessage,
              pointer: '/producer/contactDetails/emailAddress',
              errorType: 'InvalidFormat'
            }
          ])
        }
      )
    })
  })
})
