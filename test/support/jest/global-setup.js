import { ApiFactory } from '../../apis/api-factory.js'
import { testConfig } from '../test-config.js'
import { randomUUID } from 'crypto'

/**
 * @param {{ statusCode: number }} response
 * @param {string} message
 */
function assertOkResponse(response, message) {
  if (response.statusCode !== 200) {
    throw new Error(`${message}: status ${response.statusCode}`)
  }
}

/**
 * Runs once before all test workers.
 * ZAP session setup only executes when PROXY_MODE=zap. Clears the ZAP session and disables selected passive scan rules for the Docker Compose harness.
 * @returns {Promise<void>}
 */
export default async function globalSetup() {
  globalThis.testConfig = testConfig
  const apis = ApiFactory.create()

  try {
    let apiCode
    const organisationId = randomUUID()

    if (testConfig.apiCodeInGioOrgExcludeList === undefined) {
      // Create a new organisation and get the API code
      const organisationResponse =
        await apis.wasteOrganisationBackendAPI.createOrUpdateOrganisation(
          randomUUID(),
          organisationId
        )
      // TODO - Discuss with Lewis: globalSetup runs in a completely separate Node.js process before Jest initialises, so 'expect' is not available
      assertOkResponse(organisationResponse, 'Failed to create organisation')

      const apiCodeResponse =
        await apis.wasteOrganisationBackendAPI.getAllApiCodesForOrganisation(
          organisationId
        )

      assertOkResponse(
        apiCodeResponse,
        'Failed to get API codes for organisation'
      )

      apiCode = apiCodeResponse.json.apiCodes[0].code
    } else {
      const apiCodes = testConfig.apiCodeInGioOrgExcludeList
        .split(',')
        .map((code) => code.trim())
        .filter(Boolean)
      apiCode = apiCodes[Math.floor(Math.random() * apiCodes.length)]
    }

    // TODO - Discuss with Lewis: The workers cannot 'see' globalThis from this file, so we have to use process.env to share the generated API code.
    // We can move this logic into the workers (setup.js) which will run before each test, but we will be creating new API codes via the organisation API for each test, which may be undesirable.
    // For now, we will generate one API code for the entire test run and share it via an environment variable with the worker nodes.
    process.env.GENERATED_API_CODE = apiCode

    if (organisationId) {
      process.env.GENERATED_DEFRA_ID = organisationId
    } else {
      const organisationResponse =
        await apis.wasteOrganisationBackendAPI.getOrganisationByApiCode(apiCode)
      assertOkResponse(
        organisationResponse,
        'Failed to get organisation by API code'
      )

      process.env.GENERATED_DEFRA_ID =
        organisationResponse.json.defraCustomerOrganisationId
    }

    if (testConfig.proxyMode === 'zap') {
      const sessionResponse = await apis.zapApi.newSession()
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
          await apis.zapApi.setPassiveScannerAlertThreshold(pluginId, 'OFF')
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
  } finally {
    await apis.close()
  }
}
