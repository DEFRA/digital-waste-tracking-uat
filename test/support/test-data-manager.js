/**
 * Simple Test Data Manager for Waste Receipt API Tests
 *
 * This module provides centralized test data generation for waste receipt API tests,
 * ensuring consistency across all test scenarios.
 */

/**
 * Generate base waste receipt data with all required fields
 * @returns {Object} Complete waste receipt data object
 */
export const generateBaseWasteReceiptData = () => ({
  receivingSiteId: '12345678-1234-1234-1234-123456789012',
  yourUniqueReference: `REF${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  specialHandlingRequirements: 'None',
  waste: [
    {
      ewcCodes: ['020101'],
      wasteDescription: 'Mixed waste from construction and demolition',
      form: 'Mixed',
      numberOfContainers: 3,
      typeOfContainers: 'Skip containers',
      quantity: {
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
      }
    }
  ],
  carrier: {
    organisationName: 'Test Carrier Ltd',
    address: '123 Test Street, Test City, TC1 2AB',
    emailAddress: `test${Date.now()}@carrier.com`,
    phoneNumber: '01234567890',
    meansOfTransport: 'Road'
  },
  acceptance: {
    acceptingAll: true
  },
  receipt: {
    dateTimeReceived: new Date().toISOString(),
    disposalOrRecoveryCodes: [
      {
        code: 'R1',
        quantity: {
          metric: 'Tonnes',
          amount: 2.5,
          isEstimate: false
        }
      }
    ]
  }
})
