import { request } from 'undici'

/**
 * @typedef {Object} RequestOptions
 * @property {string} method - HTTP method
 * @property {Object} headers - Request headers
 * @property {string} [body] - Request body
 */

/**
 * @typedef {Object} Response
 * @property {number} statusCode - HTTP status code
 * @property {import('undici').Body} body - Response body
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
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async get(endpoint, headers = {}) {
    const { statusCode, body } = await request(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...headers }
    })
    return { statusCode, body }
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async post(endpoint, data, headers = {}) {
    const { statusCode, body } = await request(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { ...this.defaultHeaders, ...headers },
      body: JSON.stringify(data)
    })
    return { statusCode, body }
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async put(endpoint, data, headers = {}) {
    const { statusCode, body } = await request(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { ...this.defaultHeaders, ...headers },
      body: JSON.stringify(data)
    })
    return { statusCode, body }
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} [headers={}] - Additional headers
   * @returns {Promise<Response>}
   */
  async delete(endpoint, headers = {}) {
    const { statusCode, body } = await request(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: { ...this.defaultHeaders, ...headers }
    })
    return { statusCode, body }
  }

  /**
   * Set authentication token
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }
}
