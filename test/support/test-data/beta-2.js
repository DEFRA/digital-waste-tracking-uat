import { testConfig } from '../test-config.js'

/**
 * Beta-2 create-movement data.
 * Bases contain required fields only. Tests assign optional fields.
 */
export const beta2 = {
  badRequestType:
    'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',

  sicCode: '38110',
  phoneNumber: '01234567890',
  brokerPhoneNumber: '01112223333',
  commercialFullAddress: '10 Industrial Way, Test City',
  municipalFullAddress: 'Council Depot, Test City',
  reasonForNoAuthorisationNumber: 'Exemption pending renewal',
  reasonForNoRegistrationNumber: 'One-off arrangement',
  specialHandlingRequirements: 'Handle with care and keep upright.',

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
    ['Commercial', () => beta2.generateBaseCommercialMovementData()],
    ['Municipal', () => beta2.generateBaseMunicipalMovementData()]
  ],

  /**
   * POST /beta-2/movements with the required fields for a Household producer.
   * @returns {Object}
   */
  generateBaseMovementData: () => ({
    apiCode: testConfig.apiCode,
    producer: {
      wasteSource: 'Household'
    }
  }),

  /**
   * POST /beta-2/movements with the required fields for a Commercial producer.
   * @returns {Object}
   */
  generateBaseCommercialMovementData: () => ({
    apiCode: testConfig.apiCode,
    producer: {
      wasteSource: 'Commercial',
      organisationName: 'ACME Waste Producers Ltd',
      authorisationNumber: 'EAS/P/123456',
      sicCode: beta2.sicCode,
      address: {
        postcode: 'TE1 2PQ'
      },
      contactDetails: {
        emailAddress: 'producer@example.com'
      }
    }
  }),

  /**
   * POST /beta-2/movements with the required fields for a Municipal producer.
   * sicCode is optional and is not included.
   * @returns {Object}
   */
  generateBaseMunicipalMovementData: () => ({
    apiCode: testConfig.apiCode,
    producer: {
      wasteSource: 'Municipal',
      organisationName: 'Test Council',
      authorisationNumber: 'EAS/P/123456',
      address: {
        postcode: 'TE1 5CD'
      },
      contactDetails: {
        emailAddress: 'waste.services@example.gov.uk'
      }
    }
  }),

  /**
   * Broker or dealer entry with its required fields. Address is optional.
   * @returns {Object}
   */
  generateBaseBrokerOrDealer: () => ({
    organisationName: 'Broker Demo Ltd',
    registrationNumber: 'CBDU654321',
    contactDetails: {
      emailAddress: 'broker@example.com'
    }
  }),

  /**
   * A second broker or dealer entry with its required fields.
   * @returns {Object}
   */
  generateSecondBrokerOrDealer: () => ({
    organisationName: 'Second Broker Ltd',
    registrationNumber: 'ROC UT 9999',
    contactDetails: {
      phoneNumber: beta2.brokerPhoneNumber
    }
  }),

  /**
   * Optional broker or dealer address.
   * @returns {Object}
   */
  generateBrokerAddress: () => ({
    fullAddress: '2 Broker Yard, Test City',
    postcode: 'TE1 1ST'
  }),

  supportingReferenceLabels: [
    'Weighbridge Number',
    'Job Number',
    'Invoice Number',
    'Waste Ticket Number',
    'Other'
  ],

  /**
   * One supporting reference with its required fields.
   * @returns {Object}
   */
  generateBaseSupportingReference: () => ({
    label: 'PO Number',
    reference: 'PO-48213'
  }),

  /**
   * More than one supporting reference.
   * @returns {Object[]}
   */
  generateSupportingReferences: () => [
    { label: 'PO Number', reference: 'PO-48213' },
    { label: 'Job Number', reference: 'JB-9931' },
    { label: 'Weighbridge Number', reference: 'WB-9931' }
  ]
}
