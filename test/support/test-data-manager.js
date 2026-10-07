export { beta1 } from './test-data/beta-1.js'
export { beta2 } from './test-data/beta-2.js'

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
