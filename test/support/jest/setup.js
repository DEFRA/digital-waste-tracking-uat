import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../../support/test-config.js'

// Set testConfig globally at module load time (before tests are parsed). Which is needed for local authentication tests to be skipped.
globalThis.testConfig = testConfig

// Setup before each test
beforeEach(() => {
  globalThis.apis = ApiFactory.create() // Fresh instance per test
})

// Cleanup after each test
afterEach(() => {
  delete globalThis.apis // Clean up after test
})

// Global teardown - runs once after all tests
afterAll(async () => {
  // Close API agents to clean up connections
  if (globalThis.apis) {
    await Promise.all(Object.values(globalThis.apis).map((api) => api.close()))
  }
})
