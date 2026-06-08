import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../../support/test-config.js'

// Set testConfig globally at module load time (before tests are parsed).
globalThis.testConfig = testConfig

// Setup before each test
beforeEach(async () => {
  globalThis.apis = ApiFactory.create() // Fresh instance per test, each worker has its own instance
})

// Cleanup after each test
afterEach(async () => {
  await globalThis.apis?.close()
  delete globalThis.apis
})
