// jest.setup.js
import { ApiFactory } from '../apis/api-factory.js'
import { setGlobalDispatcher, Agent } from 'undici'

// If out of function will run as beforeAll:
// Configure undici with connection pooling and timeout settings
const agent = new Agent({
  connections: 10,
  pipelining: 0,
  timeout: 30000
})
setGlobalDispatcher(agent)

beforeEach(() => {
  globalThis.apis = ApiFactory.create() // Fresh instance per test
})

afterEach(() => {
  delete globalThis.apis // Clean up after test
})

// Close all connections after all tests complete
afterAll(async () => {
  await agent.close()
})
