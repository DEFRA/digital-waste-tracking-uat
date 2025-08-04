@DWT-395
Feature: Treatment Codes Validation for Waste Movement Receipt Submissions
  As a waste receiver
  I should only be able to submit waste movement receipts with valid disposal or recovery codes
  So that the intended waste treatment is documented for compliance
  
  # - Treatment codes can be found here: https://www.wastesupport.co.uk/recovery-and-disposal-codes.php/
  # - We are not comparing the quantity of the waste item to the quantity of the treatment code

  Background:
    Given I have a complete waste movement receipt with valid base data
    And I have a valid authentication header

  Scenario Outline: Successfully Submit a Waste Movement Receipt with Valid Treatment Codes and Quantities
    Given the waste item has a valid disposal or recovery code of <treatment_code> with quantity <quantity>
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

    Examples:
      | treatment_code | quantity |
      | R1             |   100 kg |
      | D10            |  50.5 kg |
      | R3             |    20 kg |
      | D5             |    30 kg |

  Scenario: Successfully Submit a Waste Movement Receipt with Multiple Instances of Different Treatment Codes
    Given the waste item has a valid disposal or recovery code of R3 with quantity 20 kg
    And the waste item has a valid disposal or recovery code of D5 with quantity 30 kg
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt with Multiple Instances of the Same Treatment Code
    Given the waste item has a valid disposal or recovery code of R3 with quantity 20 kg
    And the waste item has a valid disposal or recovery code of R3 with quantity 20 kg
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully

  Scenario: Successfully Submit a Waste Movement Receipt without Treatment Codes
    Given the waste item has no disposal or recovery codes
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was created successfully
    And I should be informed that disposal or recovery codes are required

  Scenario: Attempting to Submit a Waste Movement Receipt with Invalid Treatment Code
    Given the waste item has an unrecognized disposal or recovery code
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that the treatment code is not valid

  Scenario: Attempting to Submit a Waste Movement Receipt with Treatment Code Missing Quantity
    Given the waste item has a valid disposal or recovery code without quantity
    When I submit the waste movement receipt
    Then I should be informed that the waste movement was not created
    And I should be informed that a quantity is required for the treatment code


