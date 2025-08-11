@regression-tests
Feature: Waste Movement Update
  As a waste management system
  I want to update existing waste movements
  So that I can modify waste movement records when needed

  Background:
    Given I have access to the Waste Movement API

  Scenario: Successfully Update an Existing Waste Movement
    Given I have created a waste movement
    When I update the movement amount to 1.6
    And I submit the movement with the existing ID
    Then I should be informed that the waste movement was updated successfully

  Scenario: Fail to Update Movement with Non-existent ID
    When I submit a movement with non-existent ID "24AAA000"
    Then I should be informed that the movement was not found
