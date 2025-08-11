import { Given, Then } from '@cucumber/cucumber'
import { expect } from 'chai'

Given(
  /^the waste item indicates it contains persistent organic pollutants$/,
  function () {
    this.wasteReceiptData.waste[0].pops = {
      containsPops: true,
      pops: [
        {
          name: 'Aldrin',
          concentration: 50
        }
      ]
    }
  }
)

Given(
  'the waste item indicates it does not contain persistent organic pollutants',
  function () {
    this.wasteReceiptData.waste[0].pops = {
      containsPops: false
    }
  }
)

Given('the waste item has no POPs indicator', function () {
  // Create a POPs object but without the required containsPops boolean field
  this.wasteReceiptData.waste[0].pops = {
    pops: [
      {
        name: 'Aldrin',
        concentration: 50
      }
    ]
  }
  // Note: containsPops field is intentionally omitted to test required validation
})

Given('the waste item includes just the list of POPs', function () {
  // Create a POPs object but without the required containsPops boolean field
  this.wasteReceiptData.waste[0].pops = {
    pops: [
      {
        name: 'Aldrin',
        concentration: 50
      }
    ]
  }
  // Note: containsPops field is intentionally omitted to test required validation
})

Then('I should be informed that a POPs indicator is required', function () {
  expect(this.response.statusCode).to.equal(400)

  // Check validation errors for required POPs indicator message
  const expectedErrors = [
    {
      key: 'waste.0.pops.containsPops',
      errorType: 'NotProvided',
      message:
        'Does the waste contain persistent organic pollutants (POPs)? is required'
    }
  ]
  expect(this.response.data.validation.errors).to.deep.equal(expectedErrors)
})
