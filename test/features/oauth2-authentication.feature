@regression-tests
Feature: OAuth2 Client Credentials Authentication
  As a client application
  I want to authenticate using OAuth2 client credentials
  So that I can access protected API resources

  Background:
    Given I have access to the Gateway API

  Scenario: Successful authentication with valid credentials
    When I authenticate with valid client credentials
    Then the authentication should be successful
    And the response should contain an access token
    And the response should contain an expiration time
    And the response should contain a token type

  Scenario: Failed authentication with invalid client ID
    When I authenticate with an invalid client ID
    Then the authentication should fail
    And the response should contain an error
    And the error should be "invalid_client"

  Scenario: Failed authentication with invalid client secret
    When I authenticate with an invalid client secret
    Then the authentication should fail
    And the response should contain an error
    And the error should be "invalid_client" 