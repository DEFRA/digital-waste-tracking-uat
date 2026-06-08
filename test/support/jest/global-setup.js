import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../test-config.js'

/**
 * Runs once before all test workers when PROXY_MODE=zap.
 * Clears the ZAP session and disables selected passive scan rules for the Docker Compose harness.
 * @returns {Promise<void>}
 */
export default async function globalSetup() {
  if (testConfig.proxyMode === 'zap') {
    globalThis.testConfig = testConfig
    const apis = ApiFactory.create()
    const sessionResponse = await apis.zapApi.newSession()
    if (
      sessionResponse.statusCode !== 200 ||
      sessionResponse.json?.Result !== 'OK'
    ) {
      await apis.close()
      throw new Error(
        `ZAP newSession failed with status ${sessionResponse.statusCode} and result ${sessionResponse.json?.Result}`
      )
    }

    // Docker Compose CI uses HTTP + Basic auth on the internal network; disable in ZAP for this harness only.
    const zapPassiveScanRulesToDisable = ['10105']

    for (const pluginId of zapPassiveScanRulesToDisable) {
      const thresholdResponse =
        await apis.zapApi.setPassiveScannerAlertThreshold(pluginId, 'OFF')
      if (
        thresholdResponse.statusCode !== 200 ||
        thresholdResponse.json?.Result !== 'OK'
      ) {
        await apis.close()
        throw new Error(
          `ZAP setPassiveScannerAlertThreshold failed for plugin ${pluginId} ` +
            `(status ${thresholdResponse.statusCode}, result ${thresholdResponse.json?.Result})`
        )
      }
    }

    await apis.close()
  }
}
