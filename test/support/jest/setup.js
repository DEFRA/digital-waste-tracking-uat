import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../../support/test-config.js'
import { randomUUID } from 'crypto'

// Set testConfig globally at module load time (before tests are parsed).
globalThis.testConfig = testConfig

beforeAll(async () => {
  globalThis.apis = ApiFactory.create()
  if (globalThis.testConfig.apiCodeInGioOrgExcludeList === undefined) {
    const createCodeResponse =
      await globalThis.apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
        randomUUID()
      )
    expect(createCodeResponse.statusCode).toBe(200)
    globalThis.generatedApiCode = createCodeResponse.json.code
  } else {
    globalThis.generatedApiCode =
      globalThis.testConfig.apiCodeInGioOrgExcludeList
  }
  if (globalThis.apis) {
    await Promise.all(Object.values(globalThis.apis).map((api) => api.close()))
  }
})

// Setup before each test
beforeEach(async () => {
  globalThis.apis = ApiFactory.create() // Fresh instance per test, each worker has its own instance
})

// Cleanup after each test
afterEach(async () => {
  await globalThis.apis?.close()
  delete globalThis.apis
})

// Global teardown - runs once after all tests
afterAll(async () => {
  delete globalThis.generatedApiCode
  // Close API agents to clean up connections
  if (globalThis.apis) {
    await Promise.all(Object.values(globalThis.apis).map((api) => api.close()))
  }
})
