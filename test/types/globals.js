/**
 * @fileoverview Global type definitions for test APIs
 * This file provides JSDoc type definitions for globalThis.apis
 */

/**
 * @typedef {import('../apis/api-factory.js').ApiInstances} GlobalApis
 */

/**
 * @typedef {Object} Allure
 * @property {(name: string, fn: () => Promise<void>) => Promise<void>} step
 * @property {(name: string, content: string, type: string) => void} attachment
 * @property {(url: string, name: string) => Promise<void>} issue
 * @property {(url: string, name: string, type?: string) => Promise<void>} link
 */

/**
 * Global APIs available in tests
 * @type {import('../apis/api-factory.js').ApiInstances}
 */
globalThis.apis = null

/**
 * Global test configuration
 * @type {import('../support/test-config.js').TestConfig}
 */
globalThis.testConfig = null

/**
 * Allure reporter API provided by allure-jest during test execution
 * @type {Allure}
 */
globalThis.allure = undefined
