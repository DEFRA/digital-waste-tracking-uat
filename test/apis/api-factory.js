import { WasteMovementExternalAPI } from './wasteMovementApi.js'
import { CognitoOAuthApi } from './cognitoOAuth.js'
import { WasteMovementBackendAPI } from './wasteMovementBackendApi.js'

/**
 * @typedef {Object} ApiInstances
 * @property {WasteMovementExternalAPI} wasteMovementExternalAPI - Waste Movement External API instance
 * @property {CognitoOAuthApi} cognitoOAuthApi - Cognito OAuth instance
 * @property {WasteMovementBackendAPI} wasteMovementBackendAPI - Waste Movement Backend API instance
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
    return {
      wasteMovementExternalAPI: new WasteMovementExternalAPI(),
      cognitoOAuthApi: new CognitoOAuthApi(),
      wasteMovementBackendAPI: new WasteMovementBackendAPI()
    }
  }
}
