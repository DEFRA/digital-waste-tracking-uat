@DWT-381 @regression-tests
Feature: EWC Code Validation for Waste Movement Receipt Submissions
  As a waste receiver
  I should only be able to submit waste movement receipts with valid EWC codes
  So that the waste type is classified correctly

  Background:
    Given I have a complete waste movement receipt with valid base data
    And I have a valid authentication header

  Scenario: Successfully Submit a Waste Movement Receipt with Valid Single EWC Code
    Given the waste item has a valid 6-digit EWC code
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt with Valid Multiple EWC Codes
    Given the waste item has multiple valid 6-digit EWC codes
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Attempting to Submit a Waste Movement Receipt with Too Many EWC Codes
    Given the waste item has more than 5 EWC codes
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that a maximum of 5 EWC codes are allowed 

  Scenario: Attempting to Submit a Waste Movement Receipt with Missing EWC Code
    Given the waste item has no EWC code
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that an EWC code is required

  Scenario: Attempting to Submit a Waste Movement Receipt with Invalid EWC Code Format
    Given the waste item has an invalid EWC code format
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the EWC code format is invalid

  Scenario: Attempting to Submit a Waste Movement Receipt with Non-existent EWC Code
    Given the waste item has a non-existent EWC code
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the EWC code is not found in the official list
