import { WasteMovementExternalAPI } from './wasteMovementApi.js'
import { CognitoOAuthApi } from './cognitoOAuth.js'
import { WasteMovementBackendAPI } from './wasteMovementBackendApi.js'
import { WasteOrganisationBackendAPI } from './wasteOrganisationBackendApi.js'

/**
 * @typedef {Object} ApiInstances
 * @property {WasteMovementExternalAPI} wasteMovementExternalAPI - Waste Movement External API instance
 * @property {CognitoOAuthApi} cognitoOAuthApi - Cognito OAuth instance
 * @property {WasteMovementBackendAPI} wasteMovementBackendAPI - Waste Movement Backend API instance
 * @property {WasteOrganisationBackendAPI} wasteOrganisationBackendAPI - Waste Organisation Backend API instance
 */

/**
 * Factory class for creating API instances
 */
export class ApiFactory {
  /**
   * Create fresh API instances
   * @returns {ApiInstances}
   */
  static create() {
    const proxyMode = globalThis.testConfig?.proxyMode ?? 'off'

    let proxyInternalCalls = false
    let proxyExternalCalls = false

    if (proxyMode === 'cdp') {
      // CDP: only proxy "external" calls (e.g. Cognito) when the platform proxy is required.
      proxyExternalCalls = true
    } else if (proxyMode === 'zap') {
      // ZAP: proxy both internal + external so ZAP can observe the full flow.
      proxyInternalCalls = true
      proxyExternalCalls = true
    }

    return {
      // Internal Services
      wasteMovementExternalAPI: new WasteMovementExternalAPI(
        proxyInternalCalls
      ),
      wasteMovementBackendAPI: new WasteMovementBackendAPI(proxyInternalCalls),
      wasteOrganisationBackendAPI: new WasteOrganisationBackendAPI(
        proxyInternalCalls
      ),

      // External Services
      cognitoOAuthApi: new CognitoOAuthApi(proxyExternalCalls)
    }
  }
}
