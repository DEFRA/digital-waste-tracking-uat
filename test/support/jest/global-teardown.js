import { ApiFactory } from '../../apis/api-factory.js'
import { writeTextToFile } from '../helpers/write-text-file.js'
import {
  ZAP_ALERTS_SUMMARY_PATH,
  ZAP_HTML_REPORT_PATH,
  ZAP_JSON_REPORT_PATH
} from '../helpers/zap-report-paths.js'
import { testConfig } from '../test-config.js'

/**
 * Runs once after all test workers. Writes ZAP reports when PROXY_MODE=zap.
 * The ZAP gate is enforced by test/specs/Security/ZapGate/zap-gate.test.js (second jest run).
 * @returns {Promise<void>}
 */
export default async function globalTeardown() {
  if (testConfig.proxyMode === 'zap') {
    globalThis.testConfig = testConfig
    const apis = ApiFactory.create()
    const jsonReport = await apis.zapApi.jsonReport()
    await writeTextToFile(ZAP_JSON_REPORT_PATH, jsonReport.body)
    const htmlReport = await apis.zapApi.htmlReport()
    await writeTextToFile(ZAP_HTML_REPORT_PATH, htmlReport.body)
    const alertsSummary = await apis.zapApi.alertsSummary()
    await writeTextToFile(
      ZAP_ALERTS_SUMMARY_PATH,
      JSON.stringify(alertsSummary.json, null, 2)
    )
    await apis.close()
  }
}
