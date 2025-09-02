import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../../support/test-config.js'
import { setGlobalDispatcher, Agent } from 'undici'

let agent

// Global setup - runs once before all tests
beforeAll(async () => {
  // Configure undici for parallel test execution
  agent = new Agent({
    connections: 50, // Allow many connections for parallel tests
    pipelining: 2, // Allow pipelining for better performance
    headersTimeout: 30000, // Longer timeout for headers
    bodyTimeout: 30000, // Longer timeout for body
    keepAliveTimeout: 10000, // Longer keep-alive for connection reuse
    keepAliveMaxTimeout: 30000, // Reasonable connection timeout
    connect: {
      timeout: 15000
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
