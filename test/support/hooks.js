import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber'
import { ApiFactory } from '../apis/api-factory.js'
import { testConfig } from './test-config.js'
import { setGlobalDispatcher, Agent } from 'undici'

let agent

BeforeAll(async function () {
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

Before(function () {
  globalThis.apis = ApiFactory.create() // Fresh instance per scenario
})

After(function () {
  delete globalThis.apis // Clean up after scenario
})

AfterAll(async function () {
  await agent.close()
})
