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

    this.beta2 = {
      /**
       * POST /beta-2/movements. apiCode is the x-api-code header, not part of the body.
       * @param {Object} movementData
       * @param {string|null} [apiCode] - Header value. Defaults to the run API code. A falsy value omits the header.
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createMovement: async (
        movementData,
        apiCode = globalThis.testConfig.apiCode
      ) => {
        const requestHeaders = {
          'Content-Type': 'application/json',
          'x-cdp-request-id': randomUUID()
        }

        if (apiCode) {
          requestHeaders['x-api-code'] = apiCode
        }

        const { statusCode, headers, json } = await this.post(
          `/beta-2/movements`,
          JSON.stringify(movementData),
          requestHeaders
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-2/movements/{movementId}/collection. apiCode is the x-api-code header, not part of the body.
       * @param {string} movementId
       * @param {Object} collectionData
       * @param {string|null} [apiCode] - Header value. Defaults to the run API code. A falsy value omits the header.
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createCollection: async (
        movementId,
        collectionData,
        apiCode = globalThis.testConfig.apiCode
      ) => {
        const requestHeaders = {
          'Content-Type': 'application/json',
          'x-cdp-request-id': randomUUID()
        }

        if (apiCode) {
          requestHeaders['x-api-code'] = apiCode
        }

        const { statusCode, headers, json } = await this.post(
          `/beta-2/movements/${movementId}/collection`,
          JSON.stringify(collectionData),
          requestHeaders
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-2/deliveries. apiCode is the x-api-code header, not part of the body.
       * @param {Object} deliveryData
       * @param {string|null} [apiCode] - Header value. Defaults to the run API code. A falsy value omits the header.
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createDelivery: async (
        deliveryData,
        apiCode = globalThis.testConfig.apiCode
      ) => {
        const requestHeaders = {
          'Content-Type': 'application/json',
          'x-cdp-request-id': randomUUID()
        }

        if (apiCode) {
          requestHeaders['x-api-code'] = apiCode
        }

        const { statusCode, headers, json } = await this.post(
          `/beta-2/deliveries`,
          JSON.stringify(deliveryData),
          requestHeaders
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-2/deliveries/{deliveryId}/receipt. apiCode is the x-api-code header, not part of the body.
       * @param {string} deliveryId
       * @param {Object} receiptData
       * @param {string|null} [apiCode] - Header value. Defaults to the run API code. A falsy value omits the header.
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createReceiptWithDeliveryId: async (
        deliveryId,
        receiptData,
        apiCode = globalThis.testConfig.apiCode
      ) => {
        const requestHeaders = {
          'Content-Type': 'application/json',
          'x-cdp-request-id': randomUUID()
        }

        if (apiCode) {
          requestHeaders['x-api-code'] = apiCode
        }

        const { statusCode, headers, json } = await this.post(
          `/beta-2/deliveries/${deliveryId}/receipt`,
          JSON.stringify(receiptData),
          requestHeaders
        )

        return {
          statusCode,
          headers,
          json
        }
      },

      /**
       * POST /beta-2/receipts. apiCode is the x-api-code header, not part of the body.
       * @param {Object} receiptData
       * @param {string|null} [apiCode] - Header value. Defaults to the run API code. A falsy value omits the header.
       * @returns {Promise<import('./base-api.js').JsonResponse>}
       */
      createReceiptWithoutDeliveryId: async (
        receiptData,
        apiCode = globalThis.testConfig.apiCode
      ) => {
        const requestHeaders = {
          'Content-Type': 'application/json',
          'x-cdp-request-id': randomUUID()
        }

        if (apiCode) {
          requestHeaders['x-api-code'] = apiCode
        }

        const { statusCode, headers, json } = await this.post(
          `/beta-2/receipts`,
          JSON.stringify(receiptData),
          requestHeaders
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
