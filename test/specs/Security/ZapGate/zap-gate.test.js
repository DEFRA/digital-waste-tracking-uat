import { readFile } from 'fs/promises'
import { describe, it, expect } from '@jest/globals'
import {
  ZAP_ALERTS_SUMMARY_PATH,
  ZAP_HTML_REPORT_PATH,
  ZAP_JSON_REPORT_PATH
} from '~/test/support/helpers/zap-report-paths.js'

/**
 * Second-phase ZAP gate: run after a PROXY_MODE=zap scan (see source:clean:test:uat-zap).
 * Reads zap-report artefacts only — no ZAP API calls.
 */
describe('ZAP passive scan gate', () => {
  describe('High severity alerts', () => {
    it('should have no High severity ZAP alerts in the scan report', async () => {
      const zapJsonReport = await readFile(ZAP_JSON_REPORT_PATH, 'utf8').catch(
        () => undefined
      )
      const zapHtmlReport = await readFile(ZAP_HTML_REPORT_PATH, 'utf8').catch(
        () => undefined
      )
      const alertsSummaryRaw = await readFile(
        ZAP_ALERTS_SUMMARY_PATH,
        'utf8'
      ).catch(() => undefined)

      expect(zapJsonReport).toBeDefined()
      expect(zapHtmlReport).toBeDefined()
      expect(alertsSummaryRaw).toBeDefined()

      const alertsSummary = JSON.parse(
        /** @type {string} */ (alertsSummaryRaw)
      ).alertsSummary

      if (globalThis.allure) {
        await globalThis.allure.attachment(
          'ZAP alerts summary',
          alertsSummaryRaw,
          'application/json'
        )
        await globalThis.allure.attachment(
          'ZAP JSON report',
          zapJsonReport,
          'application/json'
        )
        await globalThis.allure.attachment(
          'ZAP HTML report',
          zapHtmlReport,
          'text/html'
        )
      }

      expect(alertsSummary.High).toBe(0)
    })
  })
})
