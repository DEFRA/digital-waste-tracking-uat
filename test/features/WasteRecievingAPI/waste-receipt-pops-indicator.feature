@DWT-389 @DRW-349 @regression-tests @this
Feature: POPs Indicator Validation for Waste Movement Receipt Submissions
  As a weighbridge operator
  I should only be able to submit waste movement receipts with valid POPs indicators
  So that the UK can meet its POP regulations and ensure that POPs are being handled correctly

  Background:
    Given I have a complete waste movement receipt with valid base data
    And I have a valid authentication header

  Scenario: Successfully Submit a Waste Movement Receipt Indicating that it Contains POPs
    Given the waste item indicates it contains persistent organic pollutants
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt Indicating that it does not Contain POPs
    Given the waste item indicates it does not contain persistent organic pollutants
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Attempting to Submit a Waste Movement Receipt with POS without indicating if it contains POPs
    Given the waste item indicates it does not contain persistent organic pollutants
    But the waste item includes just the list of POPs
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that a POPs indicator is required 