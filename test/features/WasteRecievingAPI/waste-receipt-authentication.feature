@DWT-480
Feature: Authentication for Waste Movement Receipt Submissions
  As a waste Receiver
  I should only be able to submit waste movement receipts with valid authentication
  So that the system is secure

  Background:
    Given I have a complete waste movement receipt with valid base data

  Scenario: Submitting a Waste Movement Receipt with valid Authentication
    Given I have a valid authentication header
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully 

  Scenario Outline: Submitting a Waste Movement Receipt with invalid Authentication
    Given I have <authentication_status> authentication header
    When I attempt to submit the waste movement receipt
    Then I should be informed that I am not Authenticated
    Examples:
      | authentication_status |
      | an invalid           | 
      | an expired           |
      | a missing            |
