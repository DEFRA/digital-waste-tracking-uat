import { BaseAPI } from './base-api.js'
import { randomUUID } from 'crypto'

export class WasteMovementExternalAPI extends BaseAPI {
  /**
   * @param {boolean} [useProxyWhenAvailable=false] - When true, honours HTTP_PROXY.
   */
  constructor(useProxyWhenAvailable = false) {
    super(
      globalThis.testConfig.wasteMovementExternalApiBaseUrl,
      useProxyWhenAvailable
    )

    this.beta1 = {
      /**
       * POST /beta-1/movements
       * @param {Object} movementData
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createMovement: async (movementData) => {
        const { statusCode, headers, json } = await this.post(
          `/beta-1/movements`,
          JSON.stringify(movementData),
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-1/movements/{movementId}/collection
       * @param {string} movementId
       * @param {Object} collectionData
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createCollection: async (movementId, collectionData) => {
        const { statusCode, headers, json } = await this.post(
          `/beta-1/movements/${movementId}/collection`,
          JSON.stringify(collectionData),
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-1/deliveries
       * @param {Object} deliveryData
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createDelivery: async (deliveryData) => {
        const { statusCode, headers, json } = await this.post(
          `/beta-1/deliveries`,
          JSON.stringify(deliveryData),
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-1/deliveries/{deliveryId}/receipt
       * @param {string} deliveryId
       * @param {Object} receiptData
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createReceiptWithDeliveryId: async (deliveryId, receiptData) => {
        const { statusCode, headers, json } = await this.post(
          `/beta-1/deliveries/${deliveryId}/receipt`,
          JSON.stringify(receiptData),
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-1/receipts
       * @param {Object} receiptData
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createReceiptWithoutDeliveryId: async (receiptData) => {
        const { statusCode, headers, json } = await this.post(
          `/beta-1/receipts`,
          JSON.stringify(receiptData),
          {
            'Content-Type': 'application/json',
            'x-cdp-request-id': randomUUID()
          }
        )

        return {
          statusCode,
          headers,
          json
        }
      }
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async receiveMovement(movementData) {
    const { statusCode, headers, json } = await this.post(
      '/movements/receive',
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json', 'x-cdp-request-id': randomUUID() }
    )

    return {
      statusCode,
      headers,
      json
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async receiveMovementWithId(wasteTrackingId, movementData) {
    const { statusCode, headers, json } = await this.put(
      `/movements/${wasteTrackingId}/receive`,
      JSON.stringify(movementData),
      { 'Content-Type': 'application/json', 'x-cdp-request-id': randomUUID() }
    )

    return {
      statusCode,
      headers,
      json
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async retrieveReferenceData(referenceData) {
    const { statusCode, headers, json } = await this.get(
      `/reference-data/${referenceData}`
    )

    return {
      statusCode,
      headers,
      json
    }
  }

  /**
   * POST /production-approval-tests — external API proxy to backend PAT.
   * Auth uses the Cognito bearer token set via setAuthToken.
   * @param {Array<{ scenarioId: string, wasteTrackingId: string }>} scenarios
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async runProductionApprovalTests(scenarios) {
    const { statusCode, headers, json } = await this.post(
      '/production-approval-tests',
      JSON.stringify(scenarios),
      { 'Content-Type': 'application/json', 'x-cdp-request-id': randomUUID() }
    )

    return {
      statusCode,
      headers,
      json
    }
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async getHealth() {
    const { statusCode, headers, json } = await this.get('/health')

    return {
      statusCode,
      headers,
      json
    }
  }
}
