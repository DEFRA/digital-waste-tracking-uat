import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { describe, it, expect } from '@jest/globals'
import {
  ZAP_JSON_REPORT_PATH,
  ZAP_HTML_REPORT_PATH,
  ZAP_ALERTS_SUMMARY_PATH
} from '~/test/support/helpers/zap-report-paths.js'

/**
 * Assert a scan artefact exists, read it, and attach to Allure when available.
 * @param {string} path
 * @param {string} label
 * @param {string} contentType - Allure attachment content type
 * @returns {Promise<string>}
 */
async function readZapReport(path, label, contentType) {
  expect(existsSync(path)).toBe(true)
  const content = await readFile(path, 'utf8')
  if (globalThis.allure) {
    await globalThis.allure.attachment(label, content, contentType)
  }

  return content
}

/**
 * Second-phase ZAP gate: run after a PROXY_MODE=zap scan (see source:clean:test:integration-zap:report).
 * Reads zap-report artefacts only — no ZAP API calls.
 */
describe('ZAP passive scan gate', () => {
  describe('High severity alerts', () => {
    it('should have no High severity ZAP alerts in the scan report', async () => {
      await readZapReport(
        ZAP_JSON_REPORT_PATH,
        'ZAP JSON report',
        'application/json'
      )
      await readZapReport(ZAP_HTML_REPORT_PATH, 'ZAP HTML report', 'text/html')
      const alertsSummaryRaw = await readZapReport(
        ZAP_ALERTS_SUMMARY_PATH,
        'ZAP alerts summary',
        'application/json'
      )

      const alertsSummary = JSON.parse(alertsSummaryRaw).alertsSummary

      expect(alertsSummary.High).toBe(0)
    })
  })
})
