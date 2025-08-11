@regression-tests
Feature: Waste Movement API Health and Documentation
  As a waste management system
  I want to verify the waste movement API is operational
  So that I can ensure the service is available and functioning correctly

  Background:
    Given I have access to the Waste Movement API

  Scenario: Successfully Access API Documentation
    When I request the swagger documentation
    Then I should be informed that the documentation is available
    And the content type should be "text/html; charset=utf-8"

  Scenario: Successfully Verify API Health Status
    When I request the health check
    Then I should be informed that the API is healthy
    And the response should contain success message

  Scenario: Successfully Create a New Waste Movement
    When I submit a new waste movement with valid data
    Then I should be informed that the waste movement was created successfully
    And the response should contain a global movement ID
    And the global movement ID should be a string

@this
  Scenario: Fail to Create Movement Due to Missing Required Fields
    When I submit a waste movement with missing quantity amount data
    Then I should be informed that the waste movement was not created
    And the response should contain an error message

  Scenario: Successfully Update an Existing Waste Movement
    Given I have created a waste movement
    When I update the movement amount to 1.6
    And I submit the movement with the existing ID
    Then I should be informed that the waste movement was updated successfully

  Scenario: Fail to Update Movement with Non-existent ID
    When I submit a movement with non-existent ID "24AAA000"
    Then I should be informed that the movement was not found