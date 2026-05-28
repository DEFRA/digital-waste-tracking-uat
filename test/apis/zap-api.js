import { testConfig } from '../support/test-config.js'
import { BaseAPI } from './base-api.js'

/**
 * Client for the ZAP REST API (direct to ZAP, not via the HTTP proxy).
 */
export class ZapApi extends BaseAPI {
  constructor() {
    super(testConfig.zapApiBaseUrl, false)
    this.apiKey = testConfig.zapApiKey
  }

  /**
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async newSession() {
    return this.get(
      this.#endpoint('/JSON/core/action/newSession/', {
        name: 'digital-waste-tracking-uat ',
        overwrite: 'true'
      })
    )
  }

  /**
   * @returns {Promise<import('./base-api.js').TextResponse>}
   */
  async htmlReport() {
    return this.getText(this.#endpoint('/OTHER/core/other/htmlreport/'))
  }

  /**
   * @returns {Promise<import('./base-api.js').TextResponse>}
   */
  async jsonReport() {
    return this.getText(this.#endpoint('/OTHER/core/other/jsonreport/'))
  }

  /**
   * Gets number of alerts grouped by each risk level.
   * @returns {Promise<import('./base-api.js').JsonResponse>}
   */
  async alertsSummary() {
    return this.get(this.#endpoint('/JSON/alert/view/alertsSummary/'))
  }

  /**
   * @param {string} path - API path
   * @param {Record<string, string>} [queryParams={}]
   * @returns {string}
   */
  #endpoint(path, queryParams = {}) {
    const search = new URLSearchParams({ apikey: this.apiKey })

    for (const [key, value] of Object.entries(queryParams)) {
      search.set(key, value)
    }

    return `${path}?${search}`
  }
}
