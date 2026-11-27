import { describe, it, beforeEach } from '@jest/globals'
import { GetWebIdentityTokenCommand, STSClient } from '@aws-sdk/client-sts'
import { randomUUID } from 'crypto'

import { DEFAULT_TENANT_SERVICE_NAME } from '~/test/apis/wasteMovementClientSyncApi.js'
import { addAllureLink } from '~/test/support/helpers/allure-api-logger.js'

// TEMPORARY (DWTSPI-551): finds out whether this test suite can get an AWS STS
// token on CDP, as services can, and what DWT Client Sync makes of it. It
// always passes, and attaches the outcome to the Allure report. Remove it once
// we know.
//
// - An STS error: test suites can't get tokens, so they keep basic auth
// - 403: they can. Client Sync logs the suite's role, to add to its allowed
//   callers in non-prod
// - 200: the suite is already an allowed caller

/**
 * Attaches the probe's outcome to the Allure report.
 * @param {string} outcome - What happened
 * @returns {Promise<void>}
 */
async function report(outcome) {
  await globalThis.allure.attachment('STS probe', outcome, 'text/plain')
}

describe('STS token probe (temporary)', () => {
  beforeEach(async () => {
    await addAllureLink('/DWTSPI-551', 'DWTSPI-551', 'jira')
  })

  it(
    'should report whether this suite can call Client Sync with an STS token' +
      ' @allure.label.tag:DWTSPI-551',
    async () => {
      let token
      try {
        const sts = new STSClient({ maxAttempts: 1 })
        const result = await sts.send(
          new GetWebIdentityTokenCommand({
            Audience: ['dwt-client-sync'],
            SigningAlgorithm: 'RS256',
            DurationSeconds: 60
          }),
          { abortSignal: AbortSignal.timeout(5000) }
        )
        token = result.WebIdentityToken
      } catch (err) {
        await report(`No STS token: ${err.name}: ${err.message}`)
        return
      }

      // Plain fetch, not the Client Sync API client: that records request
      // headers in the Allure report, and the token must not end up there
      const headers = {
        Authorization: `Bearer ${token}`,
        'x-cdp-request-id': randomUUID()
      }
      if (globalThis.testConfig.cdpDevApiKey != null) {
        headers['x-api-key'] = globalThis.testConfig.cdpDevApiKey
      }
      try {
        const response = await fetch(
          `${globalThis.testConfig.wasteMovementClientSyncApiBaseUrl}/clients/${encodeURIComponent(DEFAULT_TENANT_SERVICE_NAME)}`,
          { headers, signal: AbortSignal.timeout(10000) }
        )
        await report(
          `Got an STS token, Client Sync answered ${response.status}`
        )
      } catch (err) {
        await report(
          `Got an STS token, but calling Client Sync failed: ${err.name}: ${err.message}`
        )
      }
    }
  )
})
