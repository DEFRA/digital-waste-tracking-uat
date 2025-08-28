import { ApiFactory } from '../apis/api-factory.js'
import { testConfig } from './test-config.js'
import { setGlobalDispatcher, Agent } from 'undici'

let agent

// Global setup - runs once before all tests
beforeAll(async () => {
  // Configure undici with very aggressive connection cleanup
  agent = new Agent({
    connections: 1, // Minimal connections
    pipelining: 0,
    headersTimeout: 10000, // Shorter timeouts
    bodyTimeout: 10000,
    keepAliveTimeout: 100, // Very short keep-alive
    keepAliveMaxTimeout: 200,
    // Force connection cleanup
    connect: {
      timeout: 5000
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
