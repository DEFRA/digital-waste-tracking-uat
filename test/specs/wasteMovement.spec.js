import { expect } from '@jest/globals'

describe('Waste Movement API', () => {
  const generateSampleMovementData = () => ({
    receivingSiteId: '12345678-1234-1234-1234-123456789012',
    receiverReference: `REF${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    specialHandlingRequirements: 'None',
    waste: [
      {
        ewcCode: '020101',
        description: 'Mixed waste',
        form: 'Mixed',
        containers: 'Bulk',
        quantity: {
          value: 1.5,
          unit: 'Tonnes',
          isEstimate: false
        }
      }
    ],
    carrier: {
      registrationNumber: `REG${Date.now()}`,
      organisationName: 'Test Carrier Ltd',
      address: '123 Test Street',
      emailAddress: `test${Date.now()}@carrier.com`,
      companiesHouseNumber: '12345678',
      phoneNumber: '01234567890',
      vehicleRegistration: 'AB12 CDE',
      meansOfTransport: 'Road'
    },
    acceptance: {
      acceptingAll: true
    },
    receiver: {
      authorisationType: 'TBD',
      authorisationNumber: `AUTH${Date.now()}`,
      regulatoryPositionStatement: 'None'
    },
    receipt: {
      estimateOrActual: 'Actual',
      dateTimeReceived: new Date().toISOString()
    }
  })

  describe('Swagger', () => {
    test('should be able to access the swagger html doc', async () => {
      const swaggerResponse =
        await globalThis.apis.wasteMovementExternalAPI.getSwagger()
      expect(swaggerResponse.statusCode).toBe(200)
      expect(swaggerResponse.responseHeaders['content-type']).toBe(
        'text/html; charset=utf-8'
      )
    })
  })

  describe('Receive Movement', () => {
    it('should successfully receive a new waste movement', async () => {
      const sampleMovementData = generateSampleMovementData()
      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          sampleMovementData
        )

      expect(response.statusCode).toBe(200)
      expect(response.data).toHaveProperty('globalMovementId')
      expect(typeof response.data.globalMovementId).toBe('string')
      process.stdout.write(
        'Created movement with ID: ' + response.data.globalMovementId + '\n'
      )
    })

    it('should fail when required fields are missing', async () => {
      const invalidData = generateSampleMovementData()
      delete invalidData.waste[0].quantity

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          invalidData
        )

      expect(response.statusCode).toBe(400)
      expect(response.data).toHaveProperty('message')
    })
  })

  describe('Receive Movement with ID', () => {
    it('should successfully receive a movement with existing ID', async () => {
      const sampleMovementData = generateSampleMovementData()
      // console.log(JSON.stringify(sampleMovementData, null, 2));

      const receiveMovementResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          sampleMovementData
        )

      expect(receiveMovementResponse.statusCode).toBe(200)

      sampleMovementData.waste[0].quantity.value = 1.6

      const receiveMovementWithIdResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          receiveMovementResponse.data.globalMovementId,
          sampleMovementData
        )

      expect(receiveMovementWithIdResponse.statusCode).toBe(200)
    })

    it('should fail when movement ID does not exist', async () => {
      const nonExistentId = '24AAA000'
      const sampleMovementData = generateSampleMovementData()

      const response =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovementWithId(
          nonExistentId,
          sampleMovementData
        )

      expect(response.statusCode).toBe(404)
    })
  })

  describe('Hazardous Details', () => {
    const hazardousData = {
      isHazardousWaste: true,
      components: [
        {
          component: 'Test Component',
          concentration: 0.5,
          hazCode: 'H1'
        }
      ]
    }

    it('should successfully add hazardous details to a movement', async () => {
      const sampleMovementData = generateSampleMovementData()

      const receiveMovementResponse =
        await globalThis.apis.wasteMovementExternalAPI.receiveMovement(
          sampleMovementData
        )

      expect(receiveMovementResponse.statusCode).toBe(200)

      const addHazardousDetailsResponse =
        await globalThis.apis.wasteMovementExternalAPI.addHazardousDetails(
          receiveMovementResponse.data.globalMovementId,
          hazardousData
        )

      expect(addHazardousDetailsResponse.statusCode).toBe(200)
    })

    it('should fail when movement ID does not exist', async () => {
      const nonExistentId = '24AAA000'

      const addHazardousDetailsResponse =
        await globalThis.apis.wasteMovementExternalAPI.addHazardousDetails(
          nonExistentId,
          hazardousData
        )

      expect(addHazardousDetailsResponse.statusCode).toBe(404)
    })
  })
})
