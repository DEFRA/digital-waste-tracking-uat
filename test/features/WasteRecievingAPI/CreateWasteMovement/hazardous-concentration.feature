@DWT-472
Feature: Chemical or Biological Component Concentration Validation for Waste Movement Receipt Submissions
  As a waste receiver
  I should only be able to submit waste movement receipts with valid hazardous component concentrations
  So that the quantity of hazardous substances is accurately recorded and can trigger the relevant level of regulatory activity

  Background:
    Given I have a complete waste movement receipt with valid base data
    And I have a valid authentication header

  Scenario Outline: Successfully Submit a Waste Movement Receipt with Valid Numerical Concentration
    Given the waste item indicates it contains hazardous properties
    And the waste item has a chemical or biological component name
    And the chemical or biological component has a concentration value of <concentration_value> mg/kg
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully
    Examples:
      | concentration_value |
      | 12.5               |
      | 500                |
      | 0                  |

  Scenario: Successfully Submit a Waste Movement Receipt with "Not Supplied" Concentration
    Given the waste item indicates it contains hazardous properties
    And the waste item has a chemical or biological component name
    And the chemical or biological component has a concentration value of "Not Supplied"
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt with Blank Concentration
    Given the waste item indicates it contains hazardous properties
    And the waste item has a chemical or biological component name
    And the chemical or biological component has no concentration value
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully
    And I should be informed that the concentration field is legally required

  Scenario: Successfully Submit a Waste Movement Receipt without Concentration for Non-Hazardous Waste
    Given the waste item indicates it does not contain hazardous properties
    And the waste item has no chemical or biological component concentration
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Attempting to Submit a Waste Movement Receipt with Concentration for Non-Hazardous Waste
    Given the waste item indicates it does not contain hazardous properties
    And the waste item has a chemical or biological component concentration
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that a chemical or biological concentration cannot be provided when hazardous properties are not present 