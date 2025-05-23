import { ExampleAPI } from './example-api.js'
import { WasteMovementExternalAPI } from './wasteMovementApi.js'

/**
 * @typedef {Object} ApiInstances
 * @property {ExampleAPI} example - Example API instance
 * @property {WasteMovementExternalAPI} wasteMovementExternalAPI - Waste Movement External API instance
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
      example: new ExampleAPI(),
      wasteMovementExternalAPI: new WasteMovementExternalAPI()
    }
  }
}
