@DWT-395 @DWT-318 @this
Feature: Disposal or Recovery Treatment Codes Validation for Waste Movement Receipt Submissions
  As a waste receiver
  I should only be able to submit waste movement receipts with valid disposal or recovery treatment codes
  So that the intended waste treatment is documented for compliance
  # - Treatment codes can be found here: https://www.wastesupport.co.uk/recovery-and-disposal-codes.php/
  # - We are not comparing the quantity of the waste item to the quantity of the treatment code

  Background:
    Given I have a complete waste movement receipt with valid base data without disposal or recovery treatment codes
    And I have a valid authentication header

  Scenario Outline: Successfully Submit a Waste Movement Receipt with Valid Treatment Codes and Quantities
    Given the waste movement receipt has a valid disposal or recovery treatment code of <treatment_code> and a quantity of <quantity>
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

    Examples:
      | treatment_code | quantity     |
      | R1             |   100 Tonnes |
      | R3             | 20.99 Tonnes |
      | D10            | 50.10 Tonnes |
      | D5             |    30 Tonnes |

  Scenario: Successfully Submit a Waste Movement Receipt with Multiple Instances of Different Treatment Codes
    Given the waste movement receipt has a valid disposal or recovery treatment code of R3 and a quantity of 20.8 Tonnes
    And the waste movement receipt has a valid disposal or recovery treatment code of D5 and a quantity of 30 Tonnes
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt with Multiple Instances of the Same Treatment Code
    Given the waste movement receipt has a valid disposal or recovery treatment code of R3 and a quantity of 20 Tonnes
    And the waste movement receipt has a valid disposal or recovery treatment code of R3 and a quantity of 20 Tonnes
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt without Treatment Codes
    Given the waste movement receipt has no disposal or recovery treatment codes
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully
    And I should be informed that disposal or recovery treatment codes are required

  Scenario: Attempting to Submit a Waste Movement Receipt with Invalid Treatment Code
    Given the waste movement receipt has an unrecognized disposal or recovery treatment code
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the treatment code is not valid

  Scenario: Attempting to Submit a Waste Movement Receipt with Treatment Code Missing Quantity
    Given the waste movement receipt has a valid disposal or recovery treatment code without quantity
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that a quantity is required for the treatment code
