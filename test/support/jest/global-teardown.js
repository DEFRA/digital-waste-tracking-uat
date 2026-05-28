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
    await apis.close()
  }
}
