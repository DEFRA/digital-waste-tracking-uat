/**
 * Simple Test Data Manager for Waste Receipt API Tests
 *
 * This module provides centralized test data generation for waste receipt API tests,
 * ensuring consistency across all test scenarios.
 */

/**
 * Generate base waste receipt data with all required fields according to current API implementation
 * @returns {Object} Complete waste receipt data object
 */
export const generateBaseWasteReceiptData = () => ({
  receivingSiteId: '12345678-1234-1234-1234-123456789012',
  dateTimeReceived: new Date().toISOString(),
  wasteItems: [
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      physicalForm: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'SKI',
      weight: {
        metric: 'Tonnes',
        amount: 2.5,
        isEstimate: false
      },
      hazardous: {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      },
      pops: {
        containsPops: false
      }
    }
  ],
  carrier: {
    organisationName: 'Test Carrier Ltd',
    address: {
      fullAddress: '123 Test Street, Test City',
      postCode: 'TC1 2AB'
    },
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890',
    meansOfTransport: 'Road',
    registrationNumber: 'REG123456',
    vehicleRegistration: 'AB12 CDE'
  },
  receipt: {
    address: {
      fullAddress: '123 Test Street, Test City',
      postCode: 'TC1 2AB'
    }
  }
})

/**
 * Generate complete waste receipt data with all fields
 * @returns {Object} Complete waste receipt data object
 */
export const generateCompleteWasteReceiptData = () => ({
  receivingSiteId: '12345678-1234-1234-1234-123456789012',
  dateTimeReceived: new Date().toISOString(),
  wasteItems: [
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      physicalForm: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'SKI',
      weight: {
        metric: 'Kilograms',
        amount: 2.5,
        isEstimate: false
      },
      hazardous: {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      },
      pops: {
        containsPops: false
      }
      // ,disposalOrRecoveryCodes: [
      //   {
      //     code: 'R1',
      //     weight: {
      //       metric: 'Tonnes',
      //       amount: 2.5,
      //       isEstimate: false
      //     }
      //   }
      // ]
    },
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      physicalForm: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'SKI',
      weight: {
        metric: 'Grams',
        amount: 3500,
        isEstimate: false
      },
      hazardous: {
        containsHazardous: true,
        hazCodes: [1, 3],
        components: [
          {
            name: 'Mercury',
            concentration: 0.25
          }
        ]
      },
      pops: {
        containsPops: false
      }
    }
  ],
  carrier: {
    organisationName: 'Test Carrier Ltd',
    address: {
      fullAddress: '123 Test Street, Test City',
      postCode: 'TC1 2AB'
    },
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890',
    meansOfTransport: 'Road',
    registrationNumber: 'REG123456',
    vehicleRegistration: 'AB12 CDE'
  },
  brokerOrDealer: {
    organisationName: 'Test broker Ltd',
    address: {
      fullAddress: '123 Test Street, Test City',
      postCode: 'TC1 2AB'
    },
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890',
    registrationNumber: 'REG123456'
  },
  receiver: {
    organisationName: 'Test Reciever Ltd',
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890'
  },
  receipt: {
    address: {
      fullAddress: '123 Test Street, Test City',
      postCode: 'TC1 2AB'
    }
  }
})
