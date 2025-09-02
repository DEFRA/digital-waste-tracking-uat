import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../../support/test-config.js'
import { setGlobalDispatcher, Agent } from 'undici'

let agent

// Global setup - runs once before all tests
beforeAll(async () => {
  // Configure undici with default settings to prevent OAuth2 AggregateError
  agent = new Agent({
    connections: 1, // Default: single connection to prevent OAuth2 endpoint overwhelming
    pipelining: 1, // Default: no pipelining to avoid head-of-line blocking during authentication
    headersTimeout: 30000, // Custom: 30s timeout for API headers (default is 5min)
    bodyTimeout: 30000, // Custom: 30s timeout for API response bodies (default is 5min)
    keepAliveTimeout: 10000, // Custom: 10s keep-alive (default is 4s)
    keepAliveMaxTimeout: 30000, // Custom: 30s max connection lifetime (default is 10min)
    connect: {
      timeout: 15000 // Custom: 15s connection establishment timeout (default is 10s)
    }
  })
  setGlobalDispatcher(agent)

  // Set up global test configuration
  globalThis.testConfig = testConfig
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
