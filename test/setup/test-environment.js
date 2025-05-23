import { createRequire } from 'module'

import { ApiFactory } from '../apis/api-factory.js'
const require = createRequire(import.meta.url)
const AllureNodeEnvironment = require('allure-jest/node').default

class CustomEnvironment extends AllureNodeEnvironment {
  constructor(config, context) {
    super(config, context)
    this.apis = null
  }

  async setup() {
    await super.setup()
    process.stdout.write('Starting global test setup\n')

    // Initialize APIs during setup phase
    this.apis = ApiFactory.initialize()
    // Make APIs available in the test context
    this.global.apis = this.apis

    process.stdout.write('Finished global test setup\n')
  }

  async handleTestEvent(event, state) {
    // Handle test events if needed for Allure reporting
    await super.handleTestEvent(event, state)
  }

  async teardown() {
    process.stdout.write('Starting global test teardown\n')
    // Cleanup APIs
    this.apis = null
    this.global.apis = null
    await super.teardown()
    process.stdout.write('Finished global test teardown\n')
  }
}

export default CustomEnvironment
