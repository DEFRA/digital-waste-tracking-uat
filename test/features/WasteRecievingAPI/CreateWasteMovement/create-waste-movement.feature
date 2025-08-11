@regression-tests
Feature: Waste Movement Creation
  As a waste management system
  I want to create new waste movements
  So that I can record new waste movement activities

  Background:
    Given I have access to the Waste Movement API

  Scenario: Successfully Create a New Waste Movement
    When I submit a new waste movement with valid data
    Then I should be informed that the waste movement was created successfully
    And the response should contain a global movement ID

  Scenario: Fail to Create Movement Due to Missing Required Fields
    When I submit a waste movement with missing quantity amount data
    Then I should be informed that the waste movement was not created
