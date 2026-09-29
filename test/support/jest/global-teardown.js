import { writeTextToFile } from '../helpers/write-text-file.js'
import {
  ZAP_ALERTS_SUMMARY_PATH,
  ZAP_HTML_REPORT_PATH,
  ZAP_JSON_REPORT_PATH
} from '../helpers/zap-report-paths.js'

/**
 * Runs once after all test workers. Writes ZAP reports when PROXY_MODE=zap.
 * The ZAP gate is enforced by test/specs/Security/ZapGate/zap-gate.test.js (second jest run).
 * @returns {Promise<void>}
 */
export default async function globalTeardown() {
  // globalThis is the same as the one in the globalSetup.js file. But not the same as the one in the tests and the setup.js file.
  if (globalThis.testConfig.proxyMode === 'zap') {
    const jsonReport = await globalThis.apis.zapApi.jsonReport()
    await writeTextToFile(ZAP_JSON_REPORT_PATH, jsonReport.body)
    const htmlReport = await globalThis.apis.zapApi.htmlReport()
    await writeTextToFile(ZAP_HTML_REPORT_PATH, htmlReport.body)
    const alertsSummary = await globalThis.apis.zapApi.alertsSummary()
    await writeTextToFile(
      ZAP_ALERTS_SUMMARY_PATH,
      JSON.stringify(alertsSummary.json, null, 2)
    )
  }
  await globalThis.apis.close()
}
