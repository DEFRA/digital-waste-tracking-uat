import fs from 'node:fs'

class CustomReporter {
  constructor(globalConfig, reporterOptions, reporterContext) {
    this.globalConfig = globalConfig
    this.reporterOptions = reporterOptions
    this.reporterContext = reporterContext
  }

  onRunComplete(testContexts, results) {
    if (results.numFailedTests > 0) {
      // if there are failures the CDP pipeline expects a file 'FAILED' to be written
      fs.writeFileSync('FAILED', JSON.stringify(results))
    }
  }

  getLastError() {}
}

export default CustomReporter
