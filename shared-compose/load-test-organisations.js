// Loads the waste organisations the admin tool's report tests expect, from QA's
// seed script in digital-waste-tracking-fe-uat, so there's only one copy of it.
// mongo_setup.sh runs this whenever the Mongo container starts, running
// whatever is on fe-uat's main. If the script can't be downloaded or fails, it
// warns and the stack starts without them, or with only some of them
/* global print, load, sleep -- mongosh's own functions */
const https = require('https')
const fs = require('fs')
const url =
  'https://raw.githubusercontent.com/DEFRA/digital-waste-tracking-fe-uat/main/test/utils/test-data-organisations.js'
let finished = false
const warn = (message) => {
  print(
    `Couldn't load the test organisations, carrying on without them: ${message}`
  )
  finished = true
}

https
  .get(url, (res) => {
    if (res.statusCode !== 200) {
      res.resume()
      warn(`HTTP ${res.statusCode} from ${url}`)
      return
    }
    let data = ''
    res.on('data', (chunk) => (data += chunk))
    res.on('end', () => {
      try {
        fs.writeFileSync('/tmp/seed.js', data)
        load('/tmp/seed.js')
        print('Loaded the test organisations')
        finished = true
      } catch (err) {
        warn(err.message)
      }
    })
  })
  .on('error', (err) => warn(err.message))

// mongosh exits when the script ends, so wait for the download (at most 30s)
// eslint-disable-next-line no-unmodified-loop-condition -- set by the download's callbacks
for (let waited = 0; !finished && waited < 30000; waited += 100) {
  sleep(100)
}
if (!finished) {
  print(
    "Couldn't load the test organisations in time, carrying on without them"
  )
}
