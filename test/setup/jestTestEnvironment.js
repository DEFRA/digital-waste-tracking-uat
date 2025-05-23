import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const AllureNodeEnvironment = require('allure-jest/node').default

class CustomEnvironment extends AllureNodeEnvironment {
  async setup() {
    await super.setup()
  }

  async handleTestEvent(event, state) {
    await super.handleTestEvent(event, state)
  }

  async teardown() {
    await super.teardown()
  }
}

export default CustomEnvironment
