import { ExampleAPI } from './example-api.js'
import { WasteMovementExternalAPI } from './wasteMovementApi.js'

/**
 * @typedef {Object} ApiInstances
 * @property {ExampleAPI} example - Example API instance
 * @property {WasteMovementExternalAPI} wasteMovementExternalAPI - Waste Movement External API instance
 */

/**
 * Factory class for creating and managing API instances
 */
export class ApiFactory {
  /** @type {ApiInstances} */
  static instances = {}

  /**
   * Initialize all API instances
   * @returns {ApiInstances}
   */
  static initialize() {
    this.instances = {
      example: new ExampleAPI(),
      wasteMovementExternalAPI: new WasteMovementExternalAPI()
    }
    return this.instances
  }
}
