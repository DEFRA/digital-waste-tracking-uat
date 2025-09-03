import { request, Agent, ProxyAgent } from 'undici'
import {
  logAllureRequest,
  logAllureResponse
} from '../support/helpers/allure-api-logger.js'

/**
 * @typedef {Object} JsonResponse
 * @property {number} statusCode - HTTP status code
 * @property {Object} headers - Response headers
 * @property {any} json - Parsed JSON response
 */

/**
 * Base API class that provides common HTTP methods
 */
export class BaseAPI {
  /**
   * @param {string} baseUrl - Base URL for all API requests
   */
  constructor(baseUrl, useProxyWhenAvailable = false) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {}
    this.useProxyWhenAvailable = useProxyWhenAvailable

    const baseOptions = {
      connections: 1, // Default: single connection to prevent OAuth2 endpoint overwhelming
      pipelining: 1, // Default: no pipelining to avoid head-of-line blocking during authentication
      headersTimeout: 30000, // Custom: 30s timeout for API headers (default is 5min)
      bodyTimeout: 30000, // Custom: 30s timeout for API response bodies (default is 5min)
      keepAliveTimeout: 10000, // Custom: 10s keep-alive (default is 4s)
      keepAliveMaxTimeout: 30000, // Custom: 30s max connection lifetime (default is 10min)
      connect: {
        timeout: 15000 // Custom: 15s connection establishment timeout (default is 10s)
      }
    }

    if (globalThis.testConfig?.httpProxy && this.useProxyWhenAvailable) {
      this.agent = new ProxyAgent({
        uri: globalThis.testConfig.httpProxy,
        ...baseOptions
      })
    } else {
      this.agent = new Agent(baseOptions)
    }
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<JsonResponse>}
   */
  async get(endpoint, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Log request to Allure
    await logAllureRequest('GET', endpoint, url, requestHeaders)

    const response = await request(url, {
      method: 'GET',
      headers: requestHeaders,
      dispatcher: this.agent
    })

    const json = await response.body.json()

    // Log response to Allure
    await logAllureResponse(
      'GET',
      endpoint,
      response.statusCode,
      response.headers,
      json
    )

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      json
    }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {string} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<JsonResponse>}
   */
  async post(endpoint, data, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const instanceHeaders = { ...this.defaultHeaders, ...headers }

    // Log request to Allure
    await logAllureRequest('POST', endpoint, url, instanceHeaders, data)

    const response = await request(url, {
      method: 'POST',
      headers: instanceHeaders,
      body: data,
      dispatcher: this.agent
    })

    const json = await response.body.json()

    // Log response to Allure
    await logAllureResponse(
      'POST',
      endpoint,
      response.statusCode,
      response.headers,
      json
    )

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      json
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {string} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<JsonResponse>}
   */
  async put(endpoint, data, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    instanceHeaders['Content-Type'] = 'application/json'

    // Log request to Allure
    await logAllureRequest('PUT', endpoint, url, instanceHeaders, data)

    const response = await request(url, {
      method: 'PUT',
      headers: instanceHeaders,
      body: data,
      dispatcher: this.agent
    })

    const json = await response.body.json()

    // Log response to Allure
    await logAllureResponse(
      'PUT',
      endpoint,
      response.statusCode,
      response.headers,
      json
    )

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      json
    }
  }

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {string} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<JsonResponse>}
   */
  async patch(endpoint, data, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    instanceHeaders['Content-Type'] = 'application/json'

    // Log request to Allure
    await logAllureRequest('PATCH', endpoint, url, instanceHeaders, data)

    const response = await request(url, {
      method: 'PATCH',
      headers: instanceHeaders,
      body: data,
      dispatcher: this.agent
    })

    const json = await response.body.json()

    // Log response to Allure
    await logAllureResponse(
      'PATCH',
      endpoint,
      response.statusCode,
      response.headers
    )

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      json
    }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<JsonResponse>}
   */
  async delete(endpoint, headers = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Log request to Allure
    await logAllureRequest('DELETE', endpoint, url, requestHeaders)

    const response = await request(url, {
      method: 'DELETE',
      headers: requestHeaders,
      dispatcher: this.agent
    })

    // Log response to Allure
    await logAllureResponse(
      'DELETE',
      endpoint,
      response.statusCode,
      response.headers
    )

    const json = await response.body.json()

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      json
    }
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  /**
   * Build form data for OAuth token requests
   * @param {Object} data - Data to encode
   * @returns {string} URL-encoded form data
   */
  buildFormData(data) {
    return Object.entries(data)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&')
  }

  /**
   * Close the agent and clean up connections
   */
  async close() {
    if (this.agent) {
      await this.agent.close()
    }
  }
}
