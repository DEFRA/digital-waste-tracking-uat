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
 * Producer field rules follow the beta-2 create-movement schema.
 */
export const beta2 = {
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
  })
}
