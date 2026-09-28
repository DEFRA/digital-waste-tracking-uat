import { ApiFactory } from '../../apis/api-factory.js'
import { randomUUID } from 'crypto'
import { testConfig } from '../test-config.js'

/**
 * Runs once before all test workers.
 * ZAP session setup only executes when PROXY_MODE=zap. Clears the ZAP session and disables selected passive scan rules for the Docker Compose harness.
 * @returns {Promise<void>}
 */
export default async function globalSetup() {
  // globalThis is the same as the one in the globalTeardown.js file. But not the same as the one in the tests and the setup.js file.
  globalThis.testConfig = testConfig
  globalThis.apis = ApiFactory.create()

  if (
    globalThis.testConfig.apiCode === undefined ||
    globalThis.testConfig.organisationId === undefined
  ) {
    if (globalThis.testConfig.environment === 'prod') {
      throw new Error(
        'API code and organisation ID must be set in the test config for production environments'
      )
    }
    const organisationId = randomUUID()
    const organisationResponse =
      await globalThis.apis.wasteOrganisationBackendAPI.createOrUpdateOrganisation(
        randomUUID(),
        organisationId
      )
    if (organisationResponse.statusCode !== 200) {
      throw new Error(
        `createOrUpdateOrganisation failed with status ${organisationResponse.statusCode}`
      )
    }

    const apiCodeResponse =
      await globalThis.apis.wasteOrganisationBackendAPI.getAllApiCodesForOrganisation(
        organisationId
      )
    if (apiCodeResponse.statusCode !== 200) {
      throw new Error(
        `getAllApiCodesForOrganisation failed with status ${apiCodeResponse.statusCode}`
      )
    }
    const apiCode = apiCodeResponse.json?.apiCodes?.[0]?.code
    if (typeof apiCode !== 'string') {
      throw new Error(
        `getAllApiCodesForOrganisation returned an invalid api code`
      )
    }

    process.env.API_CODE = apiCode
    process.env.ORGANISATION_ID = organisationId
    // eslint-disable-next-line no-console
    console.log(
      `\n\nCreated Organisation and Api Code and set in environment variables process.env.API_CODE and process.env.ORGANISATION_ID.\n\n`
    )
  }

  if (globalThis.testConfig.proxyMode === 'zap') {
    const sessionResponse = await globalThis.apis.zapApi.newSession()
    if (
      sessionResponse.statusCode !== 200 ||
      sessionResponse.json?.Result !== 'OK'
    ) {
      throw new Error(
        `ZAP newSession failed with status ${sessionResponse.statusCode} and result ${sessionResponse.json?.Result}`
      )
    }

    // Docker Compose CI uses HTTP + Basic auth on the internal network; disable in ZAP for this harness only.
    const zapPassiveScanRulesToDisable = ['10105']

    for (const pluginId of zapPassiveScanRulesToDisable) {
      const thresholdResponse =
        await globalThis.apis.zapApi.setPassiveScannerAlertThreshold(
          pluginId,
          'OFF'
        )
      if (
        thresholdResponse.statusCode !== 200 ||
        thresholdResponse.json?.Result !== 'OK'
      ) {
        throw new Error(
          `ZAP setPassiveScannerAlertThreshold failed for plugin ${pluginId} ` +
            `(status ${thresholdResponse.statusCode}, result ${thresholdResponse.json?.Result})`
        )
      }
    }
  }
}
