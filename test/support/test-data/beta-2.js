/**
 * Beta-2 test data.
 * Each endpoint has a base of required fields. Other values are objects assigned onto that base.
 * Tests delete or update fields on the result for the scenario under test.
 */
export const beta2 = {
  badRequestType:
    'https://defra.github.io/digital-waste-tracking-api-docs/preview/problems/bad-request',

  reasonForNoAuthorisationNumber: 'Exemption pending renewal',
  reasonForNoRegistrationNumber: 'One-off arrangement',
  specialHandlingRequirements: 'Handle with care and keep upright.',

  /**
   * POST /beta-2/movements required fields. A Household producer needs only wasteSource.
   * @returns {Object}
   */
  generateBaseMovementData: () => ({
    producer: {
      wasteSource: 'Household'
    }
  }),

  /**
   * Commercial producer required fields. Assign to movement.producer.
   * @returns {Object}
   */
  commercialProducer: () => ({
    wasteSource: 'Commercial',
    organisationName: 'ACME Waste Producers Ltd',
    authorisationNumber: 'EAS/P/123456',
    sicCode: '38110',
    address: {
      postcode: 'TE1 2PQ'
    },
    contactDetails: {
      emailAddress: 'producer@example.com'
    }
  }),

  /**
   * Commercial producer required fields plus optional fullAddress and phoneNumber.
   * Assign to movement.producer.
   * @returns {Object}
   */
  commercialProducerWithOptionalValues: () => {
    const producer = beta2.commercialProducer()
    producer.address.fullAddress = '10 Industrial Way, Test City'
    producer.contactDetails.phoneNumber = '01234567890'
    return producer
  },

  /**
   * Municipal producer required fields. sicCode is optional and is not included.
   * Assign to movement.producer.
   * @returns {Object}
   */
  municipalProducer: () => ({
    wasteSource: 'Municipal',
    organisationName: 'Test Council',
    authorisationNumber: 'EAS/P/123456',
    address: {
      postcode: 'TE1 5CD'
    },
    contactDetails: {
      emailAddress: 'waste.services@example.gov.uk'
    }
  }),

  /**
   * Broker or dealer entry with its required fields. Address is optional.
   * @returns {Object}
   */
  brokerOrDealer: () => ({
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
  secondBrokerOrDealer: () => ({
    organisationName: 'Second Broker Ltd',
    registrationNumber: 'ROC UT 9999',
    contactDetails: {
      phoneNumber: '01112223333'
    }
  }),

  /**
   * Optional broker or dealer address.
   * @returns {Object}
   */
  brokerOrDealerAddress: () => ({
    fullAddress: '2 Broker Yard, Test City',
    postcode: 'TE1 1ST'
  }),

  /**
   * One supporting reference with its required fields.
   * @returns {Object}
   */
  supportingReference: () => ({
    label: 'PO Number',
    reference: 'PO-48213'
  }),

  /**
   * More than one supporting reference.
   * @returns {Object[]}
   */
  supportingReferences: () => [
    beta2.supportingReference(),
    { label: 'Job Number', reference: 'JB-9931' },
    { label: 'Weighbridge Number', reference: 'WB-9931' }
  ]
}
