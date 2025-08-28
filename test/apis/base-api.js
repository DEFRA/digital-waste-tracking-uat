import { request } from 'undici'

/**
 * @typedef {Object} Response
 * @property {number} statusCode - HTTP status code
 * @property {Object} headers - Response headers
 * @property {import('undici/types/readable').default} body - Response body
 */

/**
 * @typedef {Object} JsonResponse
 * @property {number} statusCode - HTTP status code
 * @property {Object} headers - Response headers
 * @property {any} json - Parsed JSON response
 */

/**
 * @typedef {Object} HtmlResponse
 * @property {number} statusCode - HTTP status code
 * @property {Object} headers - Response headers
 * @property {any} html - Parsed HTML response
 */

/**
 * Base API class that provides common HTTP methods
 */
export class BaseAPI {
  /**
   * @param {string} baseUrl - Base URL for all API requests
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {}
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async get(endpoint, headers = {}) {
    const response = await request(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...headers }
    })

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {string} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async post(endpoint, data, headers = {}) {
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    const response = await request(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: instanceHeaders,
      body: data
    })

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {string} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async put(endpoint, data, headers = {}) {
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    instanceHeaders['Content-Type'] = 'application/json'
    const response = await request(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: instanceHeaders,
      body: data
    })

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    }
  }

  /**
   * Make a PATCH request
   * @param {string} endpoint - API endpoint
   * @param {string} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async patch(endpoint, data, headers = {}) {
    const instanceHeaders = { ...this.defaultHeaders, ...headers }
    instanceHeaders['Content-Type'] = 'application/json'
    const response = await request(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: instanceHeaders,
      body: data
    })

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async delete(endpoint, headers = {}) {
    const response = await request(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...headers }
    })

    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
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
}
