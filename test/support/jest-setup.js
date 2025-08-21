import { ApiFactory } from '../apis/api-factory.js'
import { testConfig } from './test-config.js'
import { setGlobalDispatcher, Agent } from 'undici'

let agent

// Global setup - runs once before all tests
beforeAll(async () => {
  // Configure undici with connection pooling and timeout settings
  agent = new Agent({
    connections: 10,
    pipelining: 0,
    headersTimeout: 30000,
    bodyTimeout: 30000
  })
  setGlobalDispatcher(agent)

  // Set up global test configuration
  global.testConfig = testConfig
  global.env = testConfig.environment
})

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
  await agent.close()
})
