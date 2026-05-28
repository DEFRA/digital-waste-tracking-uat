import { join } from 'path'
import { ApiFactory } from '../../apis/api-factory.js'
import { writeTextToFile } from '../helpers/write-text-file.js'
import { testConfig } from '../test-config.js'

/**
 * Runs once after all test workers. Writes ZAP reports when PROXY_MODE=zap.
 * @returns {Promise<void>}
 */
export default async function globalTeardown() {
  if (testConfig.proxyMode === 'zap') {
    globalThis.testConfig = testConfig
    const apis = ApiFactory.create()

    const jsonReport = await apis.zapApi.jsonReport()
    await writeTextToFile(
      join(process.cwd(), 'zap-report', 'zap.json'),
      jsonReport.body
    )
    const htmlReport = await apis.zapApi.htmlReport()
    await writeTextToFile(
      join(process.cwd(), 'zap-report', 'zap.html'),
      htmlReport.body
    )
    const alertsSummary = await apis.zapApi.alertsSummary()
    await apis.close()

    if (alertsSummary.statusCode === 200) {
      if (alertsSummary.json?.alertsSummary?.High > 0) {
        // eslint-disable-next-line no-console -- intentional stderr output for ZAP gate in CI
        console.error(
          `\n\x1b[31mZAP In alertsSummary, expected High to be 0, received: \n${JSON.stringify(alertsSummary.json?.alertsSummary, null, 2)}\x1b[0m`
        )
        process.exitCode = 1
      } else {
        // eslint-disable-next-line no-console -- intentional stdout summary when ZAP gate passes
        console.log(
          `\n\x1b[32mZAP alertsSummary: \n${JSON.stringify(alertsSummary.json?.alertsSummary, null, 2)}\x1b[0m`
        )
      }
    }
  }
}
