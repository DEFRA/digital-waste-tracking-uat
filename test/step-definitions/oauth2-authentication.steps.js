import { Given, When, Then } from '@cucumber/cucumber'
import { expect } from 'chai'

Given('I have access to the Gateway API', function () {
  // Background step - no action needed
})

When('I authenticate with valid client credentials', async function () {
  this.response = await globalThis.apis.cognitoOAuthApi.authenticate(
    global.testConfig.cognitoClientId,
    global.testConfig.cognitoClientSecret
  )
})

When('I authenticate with an invalid client ID', async function () {
  this.response = await globalThis.apis.cognitoOAuthApi.authenticate(
    'err000000000000000000000r',
    global.testConfig.cognitoClientSecret
  )
})

When('I authenticate with an invalid client secret', async function () {
  this.response = await globalThis.apis.cognitoOAuthApi.authenticate(
    global.testConfig.cognitoClientId,
    'err000000000000000000000000000000000000000000000000r'
  )
})

Then('the authentication should be successful', function () {
  expect(this.response.statusCode).to.equal(200)
})

Then('the authentication should fail', function () {
  expect(this.response.statusCode).to.equal(400)
})

Then('the response should contain an access token', function () {
  expect(this.response.data).to.have.property('access_token')
})

Then('the response should contain an expiration time', function () {
  expect(this.response.data).to.have.property('expires_in')
})

Then('the response should contain a token type', function () {
  expect(this.response.data).to.have.property('token_type')
})

Then('the response should contain an error', function () {
  expect(this.response.data).to.have.property('error')
})

Then('the error should be {string}', function (expectedError) {
  expect(this.response.data.error).to.equal(expectedError)
})
