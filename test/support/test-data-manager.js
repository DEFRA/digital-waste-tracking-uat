import { testConfig } from './test-config.js'

/**
 * Simple Test Data Manager for Waste Receipt API Tests
 *
 * This module provides centralized test data generation for waste receipt API tests,
 * ensuring consistency across all test scenarios.
 */

/**
 * Generate base waste receipt data with only all required fields according to current API implementation
 * @returns {Object} Complete waste receipt data object
 */
export const generateBaseWasteReceiptData = () => ({
  // API code is determined during global-setup
  apiCode: globalThis.testConfig.apiCode,
  dateTimeReceived: new Date().toISOString(),
  wasteItems: [
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      physicalForm: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'SKI',
      containsHazardous: false,
      containsPops: false,
      weight: {
        metric: 'Tonnes',
        amount: 2.5,
        isEstimate: false
      },
      disposalOrRecoveryCodes: [
        {
          code: 'R1',
          weight: {
            metric: 'Tonnes',
            amount: 2.5,
            isEstimate: false
          }
        }
      ]
    }
  ],
  carrier: {
    registrationNumber: 'CBDL999999',
    organisationName: 'Test Carrier Ltd',
    // TODO: Remove these fields from the base data as they are not required by according to the spec https://defra.github.io/waste-tracking-service/apiSpecifications/index.html#/default/post%20movements%20receive
    meansOfTransport: 'Road',
    vehicleRegistration: 'AB12 CDE'
  },
  receiver: {
    siteName: 'Test Receiver Ltd',
    authorisationNumber: 'PPC/A/9999999'
  },
  receipt: {
    address: {
      fullAddress: '123 Test Street, Test City',
      postcode: 'TC1 2AB'
    }
  }
})

/**
 * Generate a single movement in backend bulk upload shape (with submittingOrganisation, no apiCode).
 * Use for WasteMovementBackendAPI bulk upload; pass the same defraCustomerOrganisationId for each item in the array.
 * @returns {Object} Single movement payload for POST /bulk/{id}/movements/receive
 */
export const generateBaseBulkUploadMovement = () => ({
  submittingOrganisation: {
    // Defra org ID is determined during global-setup
    defraCustomerOrganisationId: globalThis.testConfig.organisationId
  },
  dateTimeReceived: new Date().toISOString(),
  wasteItems: [
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      physicalForm: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'SKI',
      containsHazardous: false,
      containsPops: false,
      weight: {
        metric: 'Tonnes',
        amount: 2.5,
        isEstimate: false
      },
      disposalOrRecoveryCodes: [
        {
          code: 'R1',
          weight: {
            metric: 'Tonnes',
            amount: 2.5,
            isEstimate: false
          }
        }
      ]
    }
  ],
  carrier: {
    registrationNumber: 'CBDL999999',
    organisationName: 'Test Carrier Ltd',
    meansOfTransport: 'Road',
    vehicleRegistration: 'AB12 CDE'
  },
  receiver: {
    siteName: 'Test Receiver Ltd',
    authorisationNumber: 'PPC/A/9999999'
  },
  receipt: {
    address: {
      fullAddress: '123 Test Street, Test City',
      postcode: 'TC1 2AB'
    }
  }
})

/**
 * Beta-1 external API test data generators.
 */
export const beta1 = {
  /**
   * Well-formed ID that does not exist.
   */
  unknownResourceId: '00NOTFND',
  /**
   * Generate base movement data with only required fields for POST /beta-1/movements.
   * @returns {Object} Movement payload containing apiCode
   */
  generateBaseMovementData: () => ({
    apiCode: testConfig.apiCode
  }),

  /**
   * Generate base collection data with only required fields for POST /beta-1/movements/{movementId}/collection.
   * @returns {Object} Collection payload containing apiCode
   */
  generateBaseCollectionData: () => ({
    apiCode: testConfig.apiCode
  }),

  /**
   * Generate base delivery data with only required fields for POST /beta-1/deliveries.
   * @param {string[]} movementIds - Movement IDs from prior create submissions
   * @returns {Object} Delivery payload containing apiCode and movementIds
   */
  generateBaseDeliveryData: (movementIds) => ({
    apiCode: testConfig.apiCode,
    movementIds
  }),

  /**
   * Generate base receipt data with only required fields for POST /beta-1/deliveries/{deliveryId}/receipt.
   * @returns {Object} Receipt payload containing apiCode
   */
  generateBaseReceiptData: () => ({
    apiCode: testConfig.apiCode
  }),

  /**
   * Generate base receipt data with a reason for POST /beta-1/receipts (no delivery ID).
   * @returns {Object} Receipt payload containing apiCode and reason
   */
  generateBaseReceiptWithoutDeliveryIdData: () => ({
    apiCode: testConfig.apiCode,
    reason:
      'No delivery was recorded prior to receipt; waste received directly from the producer.'
  })
}

/**
 * Beta-2 external API test data generators.
 * Field rules follow the beta-2 create-movement schema.
 */
export const beta2 = {
  badRequestType:
    'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',
  sicCodeFormatMessage: 'must match pattern "^\\d{5}$"',
  postcodeFormatMessage:
    'must match pattern "^\\s*(?:(?:(([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z]\\d{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y]\\d{1,2})|(([A-Za-z]\\d[A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y]\\d?[A-Za-z])))) \\d[A-Za-z]{2})))|(?:(?:[Dd]6[Ww]|[AaC-Fc-fHhKkNnPpRrTtV-Yv-y]\\d{2}) ?[0-9AaC-Fc-fHhKkNnPpRrTtV-Yv-y]{4}))\\s*$"',
  phoneFormatMessage:
    'must match pattern "^\\s*(?=(?:\\D*\\d){7,15}\\D*$)\\+?[0-9()\\-\\s]+$"',
  emailFormatMessage: 'must match format "email"',
  authorisationNumberFormatMessage:
    'must match pattern "^\\s*(?:(?:[A-Za-z]{2}\\d{4}[A-Za-z]{2})|(?:[A-Za-z]{2}\\d{4}[A-Za-z]{2}\\/[Dd]\\d{4,5})|(?:[Ee][Pp][Rr]\\/[A-Za-z]{2}\\d{4}[A-Za-z]{2})|(?:[Ee][Pp][Rr]\\/[A-Za-z]{2}\\d{4}[A-Za-z]{2}\\/[Dd]\\d{4,5})|(?:[Ee][Aa][Ww][Mm][Ll]\\d{5,6})|(?:[Ww][Mm][Ll]\\d{5,6})|(?:[Pp][Pp][Cc]\\/[AaWwEeNn]\\/\\d{7})|(?:[Ww][Mm][Ll]\\/[LlWwEeNn]\\/\\d{7})|(?:[Ww][Mm][Ll]\\/[LlWwEeNn]\\/\\d{7}\\/\\d{2})|(?:[Pp][Pp][Cc]\\/[Aa]\\/[Ss][Ee][Pp][Aa]\\d{4}-\\d{4})|(?:[Ww][Mm][Ll]\\/[Ll]\\/[Ss][Ee][Pp][Aa]\\d{4}-\\d{4})|(?:[Ee][Aa][Ss]\\/[Pp]\\/\\d{6})|(?:[Pp]\\d{4}\\/\\d{2}[A-Za-z])|(?:[Pp]\\d{4}\\/\\d{2}[A-Za-z]\\/[Vv]\\d+)|(?:[Ww][Pp][Pp][Cc] \\d{2}\\/\\d{2})|(?:[Ww][Pp][Pp][Cc] \\d{2}\\/\\d{2}\\/[Vv]\\d+)|(?:[Ww][Mm][Ll] \\d{2}\\/\\d+(\\/[Tt])? [Ll][Nn]\\/\\d{2}\\/\\d+(\\/([MmTtCcNn]|[Vv]\\d+))*)|(?:[Ww][Mm][Ll] \\d{2}\\/\\d+ [Pp][Aa][Cc]\\/\\d{4}\\/[Ww][Cc][Ll]\\d{3}))\\s*$"',
  registrationNumberFormatMessage:
    'must match pattern "^\\s*(?:[Cc][Bb][Dd][LlUu]\\d{3,}|[Ww][Cc][Rr]/[Rr]/\\d{7}|(?:[Ss][Cc][Oo]|[Ss][Ee][Aa]|[Ss][Nn][Oo]|[Ss][Ww][Ee]|[Ww][Cc][Rr])/\\d{6}|[Pp][Cc][Tt]-[A-Za-z]-\\d{3,7}|[Rr][Oo][Cc]\\W*[UuLl][Tt]\\W*\\d{1,5})\\s*$"',
  /**
   * Postcodes accepted by the address schema.
   * UK postcodes and Irish Eircodes are case-insensitive, and surrounding spaces are allowed.
   */
  acceptedPostcodes: [
    ['a UK postcode', 'SW1A 1AA'],
    ['an Irish Eircode', 'D02 AF30'],
    ['a lowercase UK postcode', 'sw1a 1aa'],
    ['a UK postcode with surrounding spaces', '  SW1A 1AA  ']
  ],

  /**
   * Postcodes rejected by the address schema.
   * A UK postcode must include the space before the inward code.
   */
  rejectedPostcodes: [
    ['too short', 'ZZ'],
    ['a UK postcode without the required space', 'SW1A1AA'],
    ['malformed', 'NOTAPOSTCODE']
  ],

  /**
   * Phone numbers accepted by the contact-details schema.
   * 7 to 15 digits, an optional leading +, and digits, spaces, brackets or hyphens.
   */
  acceptedPhoneNumbers: [
    ['a UK phone number', '020 7946 0958'],
    ['an international phone number', '+44 20 7946 0958'],
    ['the minimum of 7 digits', '1234567'],
    ['the maximum of 15 digits', '123456789012345']
  ],

  /**
   * Phone numbers rejected by the contact-details schema.
   * Fewer than 7 digits and more than 15 digits fail the length check.
   */
  rejectedPhoneNumbers: [
    ['fewer than 7 digits', '123456'],
    ['more than 15 digits', '1234567890123456'],
    ['digits mixed with letters', '01234abc678']
  ],

  /**
   * Email addresses accepted by the contact-details schema (format "email").
   */
  acceptedEmailAddresses: [['a valid email address', 'producer@example.com']],

  /**
   * Email addresses rejected by the contact-details schema.
   */
  rejectedEmailAddresses: [
    ['no @ sign', 'producer.example.com'],
    ['no domain', 'producer@'],
    ['a domain without a dot', 'producer@example']
  ],

  /**
   * Authorisation numbers accepted by the producer schema, besides EAS/P/123456.
   * The pattern allows UK permit and exemption numbers and is case-insensitive.
   */
  acceptedAuthorisationNumbers: [
    ['an exemption number', 'AB1234CD'],
    ['a waste management licence number', 'WML123456'],
    ['a lowercase environmental permit number', 'eas/p/123456']
  ],

  /**
   * Authorisation numbers rejected by the producer schema.
   */
  rejectedAuthorisationNumbers: [
    ['not a permit or exemption number', 'NOT-A-PERMIT'],
    ['an environmental permit number with too few digits', 'EAS/P/12345']
  ],

  commercialOrMunicipal: [
    ['Commercial', () => beta2.generateCommercialMovementData()],
    ['Municipal', () => beta2.generateMunicipalMovementData()]
  ],

  /**
   * POST /beta-2/movements with a Household producer.
   * Household allows wasteSource only.
   * @returns {Object}
   */
  generateHouseholdMovementData: () => ({
    apiCode: testConfig.apiCode,
    producer: {
      wasteSource: 'Household'
    }
  }),

  /**
   * POST /beta-2/movements with a Commercial producer and an authorisation number.
   * @returns {Object}
   */
  generateCommercialMovementData: () => ({
    apiCode: testConfig.apiCode,
    producer: {
      wasteSource: 'Commercial',
      organisationName: 'ACME Waste Producers Ltd',
      authorisationNumber: 'EAS/P/123456',
      sicCode: '38110',
      address: {
        fullAddress: '10 Industrial Way, Test City',
        postcode: 'TE1 2PQ'
      },
      contactDetails: {
        emailAddress: 'producer@example.com'
      }
    }
  }),

  /**
   * POST /beta-2/movements with a Municipal producer and an authorisation number.
   * sicCode is included here and is optional for Municipal.
   * @returns {Object}
   */
  generateMunicipalMovementData: () => ({
    apiCode: testConfig.apiCode,
    producer: {
      wasteSource: 'Municipal',
      organisationName: 'Test Council',
      authorisationNumber: 'EAS/P/123456',
      sicCode: '38110',
      address: {
        fullAddress: 'Council Depot, Test City',
        postcode: 'TE1 5CD'
      },
      contactDetails: {
        emailAddress: 'waste.services@example.gov.uk'
      }
    }
  }),

  /**
   * A valid broker or dealer entry: organisation name, registration number, email and address.
   * @returns {Object}
   */
  generateBrokerOrDealerEntry: () => ({
    organisationName: 'Broker Demo Ltd',
    registrationNumber: 'CBDU654321',
    contactDetails: {
      emailAddress: 'broker@example.com'
    },
    address: {
      fullAddress: '2 Broker Yard, Test City',
      postcode: 'TE1 1ST'
    }
  }),

  /**
   * POST /beta-2/movements with a Household producer and the given broker or dealer entries.
   * @param {...Object} items
   * @returns {Object}
   */
  generateMovementWithBrokerOrDealer: (...items) => {
    const movementData = beta2.generateHouseholdMovementData()
    movementData.brokerOrDealer = { isPresent: true, items }
    return movementData
  },

  /**
   * POST /beta-2/movements with a Household producer and broker involvement declared as false.
   * @returns {Object}
   */
  generateMovementWithBrokerOrDealerNotInvolved: () => {
    const movementData = beta2.generateHouseholdMovementData()
    movementData.brokerOrDealer = { isPresent: false }
    return movementData
  },

  supportingReferenceLabels: [
    'Weighbridge Number',
    'Job Number',
    'Invoice Number',
    'Waste Ticket Number',
    'Other'
  ],

  /**
   * One supporting reference with a recognised label and a reference.
   * @returns {Object}
   */
  generateSupportingReference: () => ({
    label: 'PO Number',
    reference: 'PO-48213'
  }),

  /**
   * More than one supporting reference, each with a recognised label.
   * @returns {Object[]}
   */
  generateSupportingReferences: () => [
    { label: 'PO Number', reference: 'PO-48213' },
    { label: 'Job Number', reference: 'JB-9931' },
    { label: 'Weighbridge Number', reference: 'WB-9931' }
  ],

  /**
   * POST /beta-2/movements with a Household producer and supporting references.
   * @param {Object[]} supportingReferences
   * @returns {Object}
   */
  generateMovementWithSupportingReferences: (supportingReferences) => {
    const movementData = beta2.generateHouseholdMovementData()
    movementData.supportingReferences = supportingReferences
    return movementData
  },

  /**
   * POST /beta-2/movements with a Household producer and special handling requirements.
   * Defaults to a short instruction within the 500 character limit.
   * @param {string} [specialHandlingRequirements]
   * @returns {Object}
   */
  generateMovementWithSpecialHandling: (
    specialHandlingRequirements = 'Handle with care and keep upright.'
  ) => {
    const movementData = beta2.generateHouseholdMovementData()
    movementData.specialHandlingRequirements = specialHandlingRequirements
    return movementData
  },

  /**
   * Adds a broker or dealer, supporting references and special handling requirements.
   * @param {Object} movementData
   * @returns {Object}
   */
  withBrokerSupportingReferencesAndSpecialHandling: (movementData) => {
    movementData.brokerOrDealer = {
      isPresent: true,
      items: [beta2.generateBrokerOrDealerEntry()]
    }
    movementData.supportingReferences = beta2.generateSupportingReferences()
    movementData.specialHandlingRequirements =
      'Handle with care and keep upright.'
    return movementData
  },

  /**
   * POST /beta-2/movements for a Household producer with every field Household allows.
   * Household allows wasteSource only, plus broker or dealer, supporting references and special handling requirements.
   * @returns {Object}
   */
  generateHouseholdMovementWithAllFields: () =>
    beta2.withBrokerSupportingReferencesAndSpecialHandling(
      beta2.generateHouseholdMovementData()
    ),

  /**
   * POST /beta-2/movements for a Commercial producer with every field populated.
   * Includes email and phone, a broker or dealer, supporting references and special handling requirements.
   * @returns {Object}
   */
  generateCommercialMovementWithAllFields: () => {
    const movementData = beta2.generateCommercialMovementData()
    movementData.producer.contactDetails.phoneNumber = '01234567890'
    return beta2.withBrokerSupportingReferencesAndSpecialHandling(movementData)
  },

  /**
   * POST /beta-2/movements for a Municipal producer with every field populated.
   * Includes the optional SIC code, email and phone, a broker or dealer, supporting references and special handling requirements.
   * @returns {Object}
   */
  generateMunicipalMovementWithAllFields: () => {
    const movementData = beta2.generateMunicipalMovementData()
    movementData.producer.contactDetails.phoneNumber = '01234567890'
    return beta2.withBrokerSupportingReferencesAndSpecialHandling(movementData)
  },

  movementsWithAllFields: [
    ['Household', () => beta2.generateHouseholdMovementWithAllFields()],
    ['Commercial', () => beta2.generateCommercialMovementWithAllFields()],
    ['Municipal', () => beta2.generateMunicipalMovementWithAllFields()]
  ]
}
