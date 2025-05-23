// jest.setup.js
import { ApiFactory } from '../apis/api-factory.js'

beforeEach(() => {
  globalThis.apis = ApiFactory.create() // Fresh instance per test
})

afterEach(() => {
  delete globalThis.apis // Clean up after test
})
