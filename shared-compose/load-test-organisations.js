/* global print, load -- mongosh's own functions */
// Loads the waste organisations the admin tool's report tests expect, from QA's
// seed script in digital-waste-tracking-fe-uat, so there's only one copy of it.
// mongo_setup.sh runs this whenever the Mongo container starts, running
// whatever is on fe-uat's main. If the script can't be downloaded or fails, it
// warns and the stack starts without them, or with only some of them
const fs = require('fs')

const url =
  'https://raw.githubusercontent.com/DEFRA/digital-waste-tracking-fe-uat/main/test/utils/test-data-organisations.js'

fetch(url)
  .then((res) =>
    res.ok
      ? res.text()
      : Promise.reject(new Error(`HTTP ${res.status} from ${url}`))
  )
  .then((script) => {
    fs.writeFileSync('/tmp/test-data-organisations.js', script)
    load('/tmp/test-data-organisations.js')
    print('Loaded the test organisations')
  })
  .catch((err) =>
    print(
      `Couldn't load the test organisations, carrying on without them: ${err.message}`
    )
  )
