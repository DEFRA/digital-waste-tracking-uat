import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../test-config.js'
import { randomUUID } from 'crypto'

/**
 * Runs once before all test workers when PROXY_MODE=zap.
 * Clears the ZAP session and disables selected passive scan rules for the Docker Compose harness.
 * @returns {Promise<void>}
 */
export default async function globalSetup() {
  const apis = ApiFactory.create()
  if (globalThis.testConfig.apiCodeInGioOrgExcludeList === undefined) {
    const createCodeResponse =
      await apis.wasteOrganisationBackendAPI.createApiCodeForOrganisation(
        randomUUID()
      )
    expect(createCodeResponse.statusCode).toBe(200)
    globalThis.generatedApiCode = createCodeResponse.json.code
  } else {
    globalThis.generatedApiCode =
      globalThis.testConfig.apiCodeInGioOrgExcludeList
  }

  if (testConfig.proxyMode === 'zap') {
    globalThis.testConfig = testConfig
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
  }
  await apis?.close()
}
