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
  /**
   * Postcodes accepted by the address schema.
   * UK postcodes and Irish Eircodes are case-insensitive, and surrounding spaces are allowed.
   */
  acceptedPostcodes: [
    ['a UK postcode', 'SW1A 1AA'],
    ['an Irish Eircode', 'D02 AF30']
  ],

  /**
   * Postcodes rejected by the address schema.
   * Valid: SW1A 1AA. Invalid: SW1, SW1A1AA, SW1A 1A.
   */
  rejectedPostcodes: [
    ['invalid postcode', 'SW1'],
    ['a UK postcode without the required space', 'SW1A1AA'],
    ['a UK postcode with fewer than 6 characters', 'SW1A 1A']
  ],

  /**
   * Phone numbers accepted by the contact-details schema.
   * 7 to 15 digits, an optional leading +, and digits, spaces, brackets or hyphens.
   */
  acceptedPhoneNumbers: [
    ['a UK phone number', '020 7946 0958'],
    ['an international phone number', '+44 20 7946 0958'],
    ['phone number with minimum of 7 digits', '1234567'],
    ['phone number with maximum of 15 digits', '123456789012345']
  ],

  /**
   * Phone numbers rejected by the contact-details schema.
   * Valid: 020 7946 0958. Invalid: 020 794, 020 7946 0958 09999, 020 7946 095A.
   */
  rejectedPhoneNumbers: [
    ['phone number with fewer than 7 digits', '020 794'],
    ['phone number with more than 15 digits', '020 7946 0958 09999'],
    ['phone number with digits mixed with letters', '020 7946 095A']
  ],

  /**
   * Email addresses accepted by the contact-details schema (format "email").
   */
  acceptedEmailAddresses: [['a valid email address', 'producer@example.com']],

  /**
   * Email addresses rejected by the contact-details schema.
   */
  rejectedEmailAddresses: [
    ['email address with no @ sign', 'producer.example.com'],
    ['email address with no domain', 'producer@']
  ],

  /**
   * Authorisation numbers accepted by the producer schema, besides EAS/P/123456.
   * The value must match one of these UK permit shapes. Letters can be upper or
   * lower case, and spaces around the value are allowed.
   * AB1234CD
   * AB1234CD/D1234
   * EPR/AB1234CD
   * EPR/AB1234CD/D1234
   */
  acceptedAuthorisationNumbers: [
    ['valid authorisation number exemption number', 'AB1234CD'],
    [
      'valid authorisation number with waste management licence number',
      'AB1234CD/D1234'
    ],
    [
      'valid authorisation number with environmental permit number',
      'eas/p/123456'
    ]
  ],

  /**
   * Authorisation numbers rejected by the producer schema.
   * These do not match one of the UK permit shapes above.
   * EA/P/123456, EAS/P/12345, NOT-A-PERMIT.
   */
  rejectedAuthorisationNumbers: [
    [
      'an authorisation number that is not a permit or exemption number',
      'EA/P/123456'
    ],
    [
      'an authorisation number that is an environmental permit number EAS/P/ with fewer than 6 digits',
      'EAS/P/12345'
    ]
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
