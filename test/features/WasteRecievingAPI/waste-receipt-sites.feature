@DWT-481
Feature: Submit Waste Movement Receipts for Sites
  As an authenticated waste receiver
  I should only be able to submit waste movement receipts for sites registered to my account
  So that I cannot submit waste on behalf of other companies.

  Background:
    Given I have a complete waste movement receipt with valid base data
    And I have a valid authentication header

  Scenario: Successfully Submit a Waste Movement Receipt for an owned Site
    Given I have a Receiving Site registered to my account
    And the waste movement receipt contains my Receiving Site ID
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Attempting to Submit a Waste Movement Receipt for an unowned Site
    Given I have a Receiving Site registered to my account
    And the waste movement receipt contains a Receiving Site ID I don't own
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the Receiving Site ID is not valid for my account

  Scenario: Attempting to Submit a Waste Movement Receipt for a non-existent Site
    Given I have a Receiving Site registered to my account
    And the waste movement receipt contains a Receiving Site ID that does not exist
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the Receiving Site ID is not valid for my account

  Scenario: Attempting to Submit a Waste Movement Receipt with a missing Site ID
    Given I have a Receiving Site registered to my account
    And the waste movement receipt has no Receiving Site ID
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that I need to specify a Receiving Site ID 