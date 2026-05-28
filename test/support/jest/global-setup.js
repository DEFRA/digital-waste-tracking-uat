import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../test-config.js'

/**
 * Runs once before all test workers. Starts a ZAP session when PROXY_MODE=zap.
 * @returns {Promise<void>}
 */
export default async function globalSetup() {
  if (testConfig.proxyMode === 'zap') {
    globalThis.testConfig = testConfig
    const apis = ApiFactory.create()

    const response = await apis.zapApi.newSession()
    if (response.statusCode !== 200 && response.json?.Result !== 'OK') {
      await apis.close()
      throw new Error(
        `ZAP newSession failed with status ${response.statusCode} and result ${response.json?.Result}`
      )
    }

    await apis.close()
  }
}
