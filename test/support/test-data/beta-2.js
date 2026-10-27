/**
 * Beta-2 test data.
 * Each endpoint has a base of required fields. Other values are objects assigned onto that base.
 * Tests delete or update fields on the result for the scenario under test.
 */
export const beta2 = {
  /**
   * Well-formed ID that does not exist.
   */
  unknownResourceId: '00NOTFND',

  badRequestType:
    'https://defra.github.io/digital-waste-tracking-api-site/preview/problems/bad-request',
  unauthorizedType:
    'https://defra.github.io/digital-waste-tracking-api-site/preview/problems/unauthorized',
  notFoundType:
    'https://defra.github.io/digital-waste-tracking-api-site/preview/problems/not-found',

  reasonForNoAuthorisationNumber: 'Exemption pending renewal',
  reasonForNoRegistrationNumber: 'One-off arrangement',
  reasonForNoCarrierRegistrationNumber: 'ONE_OFF',
  otherMeansOfTransport: 'Horse and cart',
  specialHandlingRequirements: 'Handle with care and keep upright.',
  reasonForNoConsignmentCode: 'Carrier did not provide a consignment note',
  plannedCollectionDateTime: '2026-01-15T09:30:00Z',

  /**
   * POST /beta-2/movements required fields. A Household producer needs only wasteSource.
   * At least one intended carrier, one intended receiver, and one waste item are required.
   * plannedCollectionDateTime and collectionSite are required (DWTC-200).
   * @returns {Object}
   */
  generateBaseMovementData: () => ({
    producer: {
      wasteSource: 'Household'
    },
    plannedCollectionDateTime: beta2.plannedCollectionDateTime,
    collectionSite: beta2.collectionSite(),
    intendedCarriers: [beta2.intendedCarrier()],
    intendedReceivers: [beta2.intendedReceiver()],
    wasteItems: [beta2.wasteItem()]
  }),

  /**
   * Place the waste will be collected from. Always required on a movement.
   * @returns {Object}
   */
  collectionSite: () => ({
    address: {
      fullAddress: '10 Industrial Way, Test City',
      postcode: 'TE1 2PQ'
    },
    contactDetails: {
      emailAddress: 'site@example.com'
    }
  }),

  /**
   * Intended carrier with its required fields. Address is optional.
   * @returns {Object}
   */
  intendedCarrier: () => ({
    organisationName: 'Carrier Demo Ltd',
    registrationNumber: 'CBDU123456',
    meansOfTransport: 'Road',
    vehicleRegistration: 'AB12 CDE',
    contactDetails: {
      emailAddress: 'carrier@example.com'
    }
  }),

  /**
   * A second intended carrier with its required fields.
   * @returns {Object}
   */
  secondIntendedCarrier: () => ({
    organisationName: 'Second Carrier Ltd',
    registrationNumber: 'ROC UT 9999',
    meansOfTransport: 'Rail',
    contactDetails: {
      phoneNumber: '01112223333'
    }
  }),

  /**
   * Optional intended carrier address.
   * @returns {Object}
   */
  intendedCarrierAddress: () => ({
    fullAddress: '4 Carrier Lane, Test City',
    postcode: 'TE1 4CR'
  }),

  /**
   * Carrier with its required fields. Same shape as intendedCarrier; used on
   * collection, delivery and receipt. Address is optional.
   * @returns {Object}
   */
  carrier: () => beta2.intendedCarrier(),

  /**
   * Intended receiver with its required fields. fullAddress on receiptAddress is optional.
   * @returns {Object}
   */
  intendedReceiver: () => ({
    siteName: 'Receiver Site Ltd',
    authorisationNumber: 'EAS/P/123456',
    receiptAddress: {
      postcode: 'TE1 3RC'
    },
    contactDetails: {
      emailAddress: 'receiver@example.com'
    }
  }),

  /**
   * A second intended receiver with its required fields.
   * @returns {Object}
   */
  secondIntendedReceiver: () => ({
    siteName: 'Second Receiver Site Ltd',
    authorisationNumber: 'EAS/P/654321',
    receiptAddress: {
      postcode: 'TE1 2PQ'
    },
    contactDetails: {
      phoneNumber: '01112223333'
    }
  }),

  /**
   * Optional intended receiver receipt address with fullAddress.
   * Assign onto intendedReceiver().receiptAddress.
   * @returns {Object}
   */
  intendedReceiverReceiptAddress: () => ({
    fullAddress: '3 Receiver Road, Test City',
    postcode: 'TE1 3RC'
  }),

  /**
   * Physical form, containers and total weight. Required on a waste item and on a receipt.
   * @returns {Object}
   */
  physicalDetails: () => ({
    form: 'SOLID',
    containerType: 'DRU',
    containerCount: 4,
    totalWeight: {
      amount: 250.5,
      unit: 'KILOGRAMS',
      isEstimate: false
    }
  }),

  /**
   * Hazardous properties when none are present.
   * @returns {Object}
   */
  hazardousNotPresent: () => ({
    isPresent: false
  }),

  /**
   * A hazardous component declared with an amount (unit required with amount).
   * @returns {Object}
   */
  hazardousComponentWithAmount: () => ({
    name: 'Mercury',
    unit: 'MG_PER_KG',
    amount: 5
  }),

  /**
   * A hazardous component declared against its WM3 threshold (no amount).
   * Threshold is EQUAL_TO or GREATER_THAN only (no LESS_THAN).
   * @returns {Object}
   */
  hazardousComponentWithThreshold: () => ({
    name: 'Lead compounds',
    threshold: 'GREATER_THAN'
  }),

  /**
   * Hazardous waste with codes, source and at least one component (DWTC-247).
   * @returns {Object}
   */
  hazardousPresent: () => ({
    isPresent: true,
    codes: ['HP_4', 'HP_8'],
    componentsSource: 'OWN_TESTING',
    componentsNotApplicable: false,
    components: [beta2.hazardousComponentWithAmount()]
  }),

  /**
   * Hazardous waste with components declared as not applicable (no components array).
   * @returns {Object}
   */
  hazardousComponentsNotApplicable: () => ({
    isPresent: true,
    codes: ['HP_14'],
    componentsSource: 'GUIDANCE',
    componentsNotApplicable: true
  }),

  /**
   * POPs when none are present.
   * @returns {Object}
   */
  popsNotPresent: () => ({
    isPresent: false
  }),

  /**
   * A POP declared with an amount (unit required with amount).
   * @returns {Object}
   */
  popComponentWithAmount: () => ({
    code: 'PFOA',
    unit: 'MG_PER_KG',
    amount: 0.5
  }),

  /**
   * A POP declared against its WM3 threshold (no amount).
   * @returns {Object}
   */
  popComponentWithThreshold: () => ({
    code: 'PFOS',
    threshold: 'LESS_THAN'
  }),

  /**
   * POPs present with source and at least one component (flat PopComponent shape).
   * @returns {Object}
   */
  popsPresent: () => ({
    isPresent: true,
    componentsSource: 'OWN_TESTING',
    components: [beta2.popComponentWithAmount()]
  }),

  /**
   * Dual / mirror EWC codes (within the permitted maximum of 5).
   * @returns {string[]}
   */
  mirrorEwcCodes: () => ['170504', '191212'],

  /**
   * More than 5 EWC codes (above the permitted maximum).
   * @returns {string[]}
   */
  ewcCodesBeyondMaximum: () => [
    '170504',
    '191212',
    '170904',
    '170604',
    '200101',
    '200301'
  ],

  /**
   * Non-hazardous waste classification. Required on a waste item.
   * @returns {Object}
   */
  classification: () => ({
    wasteDescription: 'Mixed municipal waste',
    ewcCodes: ['200301'],
    pops: beta2.popsNotPresent(),
    hazardous: beta2.hazardousNotPresent()
  }),

  /**
   * Hazardous waste classification. Assign onto a waste item; pair with
   * consignmentNote() or consignmentNoteWithReason() on the movement.
   * @returns {Object}
   */
  hazardousClassification: () => ({
    wasteDescription: 'Fluorescent tubes',
    ewcCodes: ['200121'],
    pops: beta2.popsNotPresent(),
    hazardous: beta2.hazardousPresent()
  }),

  /**
   * Movement-level consignment note with a valid EA / NRW code.
   * @returns {Object}
   */
  consignmentNote: () => ({
    code: 'CJTILE/A0001'
  }),

  /**
   * Movement-level consignment note with a reason instead of a code.
   * @returns {Object}
   */
  consignmentNoteWithReason: () => ({
    reasonForNoCode: beta2.reasonForNoConsignmentCode
  }),

  /**
   * A waste item with its required fields.
   * @returns {Object}
   */
  wasteItem: () => ({
    classification: beta2.classification(),
    physicalDetails: beta2.physicalDetails()
  }),

  /**
   * A second non-hazardous waste item with a different EWC code.
   * @returns {Object}
   */
  secondWasteItem: () => ({
    classification: {
      wasteDescription: 'Soil and stones',
      ewcCodes: ['170504'],
      pops: {
        isPresent: false
      },
      hazardous: beta2.hazardousNotPresent()
    },
    physicalDetails: beta2.physicalDetails()
  }),

  /**
   * A disposal or recovery treatment with its required fields.
   * Required on receipts (top-level treatments, or per waste item without a delivery).
   * @returns {Object}
   */
  treatment: () => ({
    disposalOrRecoveryCode: 'R3',
    weight: {
      amount: 250.5,
      unit: 'KILOGRAMS',
      isEstimate: false
    }
  }),

  /**
   * A second treatment with a different disposal or recovery code.
   * @returns {Object}
   */
  secondTreatment: () => ({
    disposalOrRecoveryCode: 'D10',
    weight: {
      amount: 100,
      unit: 'KILOGRAMS',
      isEstimate: false
    }
  }),

  /**
   * POST /beta-2/movements/{movementId}/collection required fields.
   * @returns {Object}
   */
  generateBaseCollectionData: () => ({
    carrier: beta2.carrier(),
    dutyOfCareConfirmed: true
  }),

  /**
   * POST /beta-2/deliveries required fields.
   * @param {string[]} movementIds - Movement IDs from prior create submissions
   * @returns {Object}
   */
  generateBaseDeliveryData: (movementIds) => ({
    movementIds,
    carrier: beta2.carrier()
  }),

  /**
   * POST /beta-2/deliveries/{deliveryId}/receipt required fields.
   * @returns {Object}
   */
  generateBaseReceiptData: () => ({
    carrier: beta2.carrier(),
    receiver: beta2.intendedReceiver(),
    physicalDetails: beta2.physicalDetails(),
    hazardous: beta2.hazardousNotPresent(),
    treatments: [beta2.treatment()]
  }),

  /**
   * POST /beta-2/receipts required fields.
   * @returns {Object}
   */
  generateBaseReceiptWithoutDeliveryIdData: () => ({
    reasonForNoDeliveryId:
      'No delivery was recorded prior to receipt; waste received directly from the producer.',
    carrier: beta2.carrier(),
    receiver: beta2.intendedReceiver(),
    wasteItems: [
      {
        ...beta2.wasteItem(),
        treatments: [beta2.treatment()]
      }
    ]
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
