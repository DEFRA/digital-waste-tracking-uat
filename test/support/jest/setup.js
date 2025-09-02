import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../../support/test-config.js'
import { setGlobalDispatcher, Agent } from 'undici'
import os from 'node:os'

let agent

// Global setup - runs once before all tests
beforeAll(async () => {
  // Configure undici for parallel test execution
  const cpuCount = Math.max(os.cpus().length, 1)
  const maxConnections = cpuCount * 10 // 10 connections per CPU core, minimum 50

  agent = new Agent({
    connections: maxConnections, // Scale with system resources
    pipelining: cpuCount, // Allow pipelining for better performance
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
