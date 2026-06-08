import { join } from 'path'

/** @private @type {string} ZAP scan artefact directory (written in globalTeardown when PROXY_MODE=zap). */
const ZAP_REPORT_DIR = join(process.cwd(), 'zap-report')

/** @type {string} ZAP traditional JSON report from the scan run. */
export const ZAP_JSON_REPORT_PATH = join(ZAP_REPORT_DIR, 'zap.json')

/** @type {string} ZAP HTML report from the scan run. */
export const ZAP_HTML_REPORT_PATH = join(ZAP_REPORT_DIR, 'zap.html')

/** @type {string} Risk counts from ZAP alertsSummary API (written alongside zap.json for quick inspection). */
export const ZAP_ALERTS_SUMMARY_PATH = join(
  ZAP_REPORT_DIR,
  'alerts-summary.json'
)
