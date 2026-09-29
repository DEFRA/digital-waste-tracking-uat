import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../test-config.js'

// globalThis is only global within this process. Independent parallel runs, and the setup and teardown phases, each run in their own process.
beforeAll(() => {
  globalThis.testConfig = testConfig
})

beforeEach(() => {
  globalThis.apis = ApiFactory.create()
})

afterEach(async () => {
  await globalThis.apis?.close()
  delete globalThis.apis
})
