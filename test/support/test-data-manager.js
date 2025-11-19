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
  apiCode: '1f83215e-4b90-4785-9ab2-2614839aa2e9',
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
    authorisationNumbers: ['PPC/A/9999999']
  },
  receipt: {
    address: {
      fullAddress: '123 Test Street, Test City',
      postcode: 'TC1 2AB'
    }
  }
})
