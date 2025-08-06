@regression-tests
Feature: Waste Movement API
  As a waste management system
  I want to interact with the waste movement API
  So that I can manage waste movements and track hazardous materials

  Background:
    Given I have access to the Waste Movement API

  Scenario: Access Swagger documentation
    When I request the swagger documentation
    Then the response status should be 200
    And the content type should be "text/html; charset=utf-8"

  Scenario: Health check returns success
    When I request the health check
    Then the response status should be 200
    And the response should contain success message

  Scenario: Successfully receive a new waste movement
    When I submit a new waste movement with valid data
    Then the response status should be 200
    And the response should contain a global movement ID
    And the global movement ID should be a string

  Scenario: Fail to receive movement with missing required fields
    When I submit a waste movement with missing quantity data
    Then the response status should be 400
    And the response should contain an error message

  Scenario: Successfully receive a movement with existing ID
    Given I have created a waste movement
    When I update the movement quantity to 1.6
    And I submit the movement with the existing ID
    Then the response status should be 200

  Scenario: Fail to receive movement with non-existent ID
    When I submit a movement with non-existent ID "24AAA000"
    Then the response status should be 404

  Scenario: Successfully add hazardous details to a movement
    Given I have created a waste movement
    When I add hazardous details to the movement
    Then the response status should be 200

  Scenario: Fail to add hazardous details to non-existent movement
    When I add hazardous details to movement with ID "24AAA000"
    Then the response status should be 404 