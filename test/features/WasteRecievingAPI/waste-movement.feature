@regression-tests
Feature: Waste Movement API Health and Documentation
  As a waste management system
  I want to verify the waste movement API is operational
  So that I can ensure the service is available and functioning correctly

  Background:
    Given I have access to the Waste Movement API

  Scenario: Successfully Access API Documentation
    When I request the swagger documentation
    Then I should recieve the documentation

  Scenario: Successfully Verify API Health Status
    When I request the health check
    Then I should recieve the health check response